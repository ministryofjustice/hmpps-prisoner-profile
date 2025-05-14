import { Readable } from 'stream'
import superagent from 'superagent'
import Agent, { HttpsAgent } from 'agentkeepalive'

import logger from '../../logger'
import type { UnsanitisedError } from '../sanitisedError'
import sanitiseError from '../sanitisedError'
import { ApiConfig } from '../config'

interface GetRequest {
  path?: string
  query?: object | string
  headers?: Record<string, string>
  responseType?: string
  ignore404?: boolean
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

interface StreamRequest {
  path?: string
  headers?: Record<string, string>
  query?: object | string
  errorLogger?: (e: UnsanitisedError) => void
}

export default class RestClient {
  agent: Agent

  constructor(
    private readonly name: string,
    private readonly config: ApiConfig,
    private readonly token: string,
  ) {
    this.agent = config.url.startsWith('https') ? new HttpsAgent(config.agent) : new Agent(config.agent)
  }

  private apiUrl() {
    return this.config.url
  }

  private timeoutConfig() {
    return this.config.timeout
  }

  async get<T>({
    path = null,
    query = '',
    headers = {},
    responseType = '',
    ignore404 = false,
  }: GetRequest): Promise<T> {
    const endpoint = `${this.apiUrl()}${path}`
    try {
      const result = await superagent
        .get(endpoint)
        .agent(this.agent)
        .retry(2, (err, res) => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .query(query)
        .auth(this.token, { type: 'bearer' })
        .set(headers)
        .responseType(responseType)
        .timeout(this.timeoutConfig())

      return result.body
    } catch (error) {
      if (ignore404 && error.response?.status === 404) return null

      const sanitisedError = sanitiseError(error, endpoint)
      logger.warn({ ...sanitisedError, query }, `Error calling ${this.name}, path: '${path}', verb: 'GET'`)
      throw sanitisedError
    }
  }

  async post<T>({ path = null, query = '', headers = {}, responseType = '', data = {} }: PostRequest = {}): Promise<T> {
    const endpoint = `${this.apiUrl()}${path}`
    try {
      const result = await superagent
        .post(endpoint)
        .send(data)
        .agent(this.agent)
        .query(query)
        .retry(2, (err, res) => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .auth(this.token, { type: 'bearer' })
        .set(headers)
        .responseType(responseType)
        .timeout(this.timeoutConfig())

      return result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error, endpoint)
      logger.warn({ ...sanitisedError }, `Error calling ${this.name}, path: '${path}', verb: 'POST'`)
      throw sanitisedError
    }
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
    const endpoint = `${this.apiUrl()}${path}`
    const request = superagent(method, endpoint)
      .type('form')
      .agent(this.agent)
      .query(query)
      .auth(this.token, { type: 'bearer' })
      .set(headers)
      .responseType(responseType)
      .timeout(this.timeoutConfig())
      .retry(2, (err, res) => {
        if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
        return undefined // retry handler only for logging retries, not to influence retry logic
      })

    Object.entries(data).forEach(([key, value]) => {
      request.field(key, value)
    })

    if (files) {
      Object.entries(files).forEach(([key, file]) => {
        request.attach(key, file.buffer, file.originalname)
      })
    }

    try {
      const result = await request
      return result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error, endpoint)
      logger.warn({ ...sanitisedError }, `Error calling ${this.name}, path: '${path}', verb: ${method}`)
      throw sanitisedError
    }
  }

  async put<T>({ path = null, query = '', headers = {}, responseType = '', data = {} }: PutRequest = {}): Promise<T> {
    const endpoint = `${this.apiUrl()}${path}`
    try {
      const result = await superagent
        .put(endpoint)
        .send(data)
        .agent(this.agent)
        .query(query)
        .retry(2, (err, res) => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .auth(this.token, { type: 'bearer' })
        .set(headers)
        .responseType(responseType)
        .timeout(this.timeoutConfig())

      return result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error, endpoint)
      logger.warn({ ...sanitisedError }, `Error calling ${this.name}, path: '${path}', verb: 'PUT'`)
      throw sanitisedError
    }
  }

  async patch<T>({ path = null, query = '', headers = {}, responseType = '', data = {} }: PutRequest = {}): Promise<T> {
    const endpoint = `${this.apiUrl()}${path}`
    try {
      const result = await superagent
        .patch(endpoint)
        .send(data)
        .agent(this.agent)
        .query(query)
        .retry(2, (err, res) => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .auth(this.token, { type: 'bearer' })
        .set(headers)
        .responseType(responseType)
        .timeout(this.timeoutConfig())

      return result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error, endpoint)
      logger.warn({ ...sanitisedError }, `Error calling ${this.name}, path: '${path}', verb: 'PATCH'`)
      throw sanitisedError
    }
  }

  async stream({ path = null, query = '', headers = {} }: StreamRequest = {}): Promise<Readable> {
    const endpoint = `${this.apiUrl()}${path}`
    return new Promise((resolve, reject) => {
      superagent
        .get(endpoint)
        .query(query)
        .agent(this.agent)
        .auth(this.token, { type: 'bearer' })
        .retry(2, (err, res) => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .timeout(this.timeoutConfig())
        .set(headers)
        .end((error, response) => {
          if (error) {
            logger.warn(sanitiseError(error, endpoint), `Error calling ${this.name}: ${path}`)
            reject(error)
          } else if (response) {
            const s = new Readable()
            // eslint-disable-next-line no-underscore-dangle,no-empty-function
            s._read = () => {}
            s.push(response.body)
            s.push(null)
            resolve(s)
          }
        })
    })
  }

  async delete<T>({ path = null, query = '', headers = {}, responseType = '' }: GetRequest = {}): Promise<T> {
    const endpoint = `${this.apiUrl()}${path}`
    try {
      const result = await superagent
        .delete(endpoint)
        .agent(this.agent)
        .query(query)
        .auth(this.token, { type: 'bearer' })
        .set(headers)
        .responseType(responseType)
        .timeout(this.timeoutConfig())

      return result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error, endpoint)
      logger.warn({ ...sanitisedError }, `Error calling ${this.name}, path: '${path}', verb: 'DELETE'`)
      throw sanitisedError
    }
  }
}
