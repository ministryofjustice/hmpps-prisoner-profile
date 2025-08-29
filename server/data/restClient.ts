import { RestClient as HmppsRestClient } from '@ministryofjustice/hmpps-rest-client'
import logger from '../../logger'
import { ApiConfig } from '../config'

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

export default class RestClient extends HmppsRestClient {
  constructor(
    protected readonly name: string,
    protected readonly config: ApiConfig,
    protected readonly token: string,
  ) {
    super(name, config, logger)
  }

  async getAndIgnore404<T>(options: Parameters<typeof this.get>[0]): Promise<T> {
    return this.get<T>(
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
        .retry(2, (err, res) => {
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
