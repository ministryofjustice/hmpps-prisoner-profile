import { ApiConfig, RestClient as HmppsRestClient, SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import { ErrorLogger } from '@ministryofjustice/hmpps-rest-client/dist/main/types/Errors'
import { Readable } from 'stream'
import CircuitBreaker from 'opossum'
import appConfig from '../config'
import logger, { warnLevelLogger } from '../../logger'

interface ErrorHandler<Response, ErrorData> {
  (path: string, method: string, error: SanitisedError<ErrorData>): Response
}

interface Request<Response, ErrorData> {
  path: string
  query?: object | string
  headers?: Record<string, string>
  responseType?: string
  retries?: number
  raw?: boolean
  errorHandler?: ErrorHandler<Response, ErrorData>
}

interface RequestWithBody<Response, ErrorData> extends Request<Response, ErrorData> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: Record<string, any> | string | Array<any> | undefined
  retry?: boolean
}

export interface StreamRequest<ErrorData> {
  path: string
  headers?: Record<string, string>
  errorLogger?: ErrorLogger<ErrorData>
}

interface PostRequest {
  path?: string
  headers?: Record<string, string>
  responseType?: string
  data?: object | string[]
  query?: object | string
  files?: { [key: string]: { buffer: Buffer; originalname: string } }
}

interface PutRequest {
  path?: string
  headers?: Record<string, string>
  responseType?: string
  data?: object | string[]
  query?: object | string
  files?: { [key: string]: { buffer: Buffer; originalname: string } }
}

// To allow circuit breaker options in config
interface CustomApiConfig extends ApiConfig {
  circuitBreakerOptions?: CircuitBreaker.Options<[request: Request<unknown, unknown>, token: string]>
}

export default abstract class RestClient extends HmppsRestClient {
  private readonly breaker: CircuitBreaker

  protected constructor(
    protected readonly name: string,
    protected readonly config: CustomApiConfig,
    protected readonly token: string,
  ) {
    // only log warn level and above in production for API clients to reduce app insights usage
    // (dependencies are separately tracked):
    super(name, config, appConfig.production ? warnLevelLogger : logger)

    this.breaker = new CircuitBreaker<[Request<unknown, unknown>, string], unknown>(
      async (request, tokenString) => super.get<unknown, unknown>(request, tokenString),
      config.circuitBreakerOptions || appConfig.defaultCircuitBreakerOptions,
    )
  }

  // Overridden get function to enforce use of token and the circuit breaker
  async get<Response = unknown, ErrorData = unknown>(
    {
      path,
      query = {},
      headers = {},
      responseType = '',
      raw = false,
      retries = 2,
      errorHandler = this.handleError,
    }: Request<Response, ErrorData>,
    token: string,
  ): Promise<Response> {
    const request = { path, query, headers, responseType, raw, retries, errorHandler }
    return appConfig.featureToggles.circuitBreakerEnabled
      ? (this.breaker.fire(request, token) as Promise<Response>)
      : super.get<Response, ErrorData>(request, token)
  }

  // Overridden patch function to enforce use of token
  async patch<Response = unknown, ErrorData = unknown>(
    request: RequestWithBody<Response, ErrorData>,
    token: string,
  ): Promise<Response> {
    return super.patch(request, token)
  }

  // Overridden post function to enforce use of token
  async post<Response = unknown, ErrorData = unknown>(
    request: RequestWithBody<Response, ErrorData>,
    token: string,
  ): Promise<Response> {
    return super.post(request, token)
  }

  // Overridden put function to enforce use of token
  async put<Response = unknown, ErrorData = unknown>(
    request: RequestWithBody<Response, ErrorData>,
    token: string,
  ): Promise<Response> {
    return super.put(request, token)
  }

  // Overridden delete function to enforce use of token
  async delete<Response = unknown, ErrorData = unknown>(
    {
      path,
      query = {},
      headers = {},
      responseType = '',
      raw = false,
      retries = 2,
      errorHandler = this.handleError,
    }: Request<Response, ErrorData>,
    token: string,
  ): Promise<Response> {
    return super.delete({ path, query, headers, responseType, raw, retries, errorHandler }, token)
  }

  // Overridden stream function to enforce use of token
  async stream<ErrorData = unknown>(
    { path, headers = {}, errorLogger = this.logError }: StreamRequest<ErrorData>,
    token: string,
  ): Promise<Readable> {
    return super.stream({ path, headers, errorLogger }, token)
  }

  async getAndIgnore404<Response = unknown, ErrorData = unknown>(
    options: Parameters<typeof this.get>[0],
  ): Promise<Response | null> {
    return this.get<Response, ErrorData>(
      {
        ...options,
        errorHandler: (_path, _method, error): null => {
          if (error.responseStatus === 404) return null
          throw error
        },
      },
      this.token,
    )
  }

  async postMultipart<T>({
    path = null,
    query = '',
    headers = {},
    responseType = '',
    files = null,
    data = {},
  }: PostRequest = {}): Promise<T> {
    return this.requestMultipart('POST', {
      path,
      query,
      headers,
      responseType,
      files,
      data,
    })
  }

  async putMultipart<T>({
    path = null,
    query = '',
    headers = {},
    responseType = '',
    files = null,
    data = {},
  }: PutRequest | PostRequest = {}): Promise<T> {
    return this.requestMultipart('PUT', {
      path,
      query,
      headers,
      responseType,
      files,
      data,
    })
  }

  async requestMultipart<T>(
    method: 'POST' | 'PUT',
    {
      path = null,
      query = '',
      headers = {},
      responseType = '',
      files = null,
      data = {},
    }: PutRequest | PostRequest = {},
  ): Promise<T> {
    return this.makeRestClientCall(this.token, async ({ superagent, token, agent }) => {
      const s =
        method === 'PUT' ? superagent.put(`${this.config.url}${path}`) : superagent.post(`${this.config.url}${path}`)

      const request = s
        .type('form')
        .agent(agent)
        .query(query)
        .auth(token, { type: 'bearer' })
        .set(headers)
        .responseType(responseType)
        .timeout(this.config.timeout)
        .retry(2, (err, _res) => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })

      Object.entries(data).forEach(([key, value]) => {
        request.field(key, value)
      })

      if (files) {
        Object.entries(files).forEach(([key, file]) => {
          request.attach(key, file.buffer, file.originalname?.replaceAll("'", ''))
        })
      }

      const result = await request
      return result.body
    })
  }
}
