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
  raw?: boolean
  ignore404?: boolean
}

interface PostRequest {
  path?: string
  headers?: Record<string, string>
  responseType?: string
  data?: object | string[]
  raw?: boolean
  query?: object | string
}

interface PutRequest {
  path?: string
  headers?: Record<string, string>
  responseType?: string
  data?: object | string[]
  raw?: boolean
  query?: object | string
}

interface StreamRequest {
  path?: string
  headers?: Record<string, string>
  errorLogger?: (e: UnsanitisedError) => void
}

export function RestClientBuilder(name: string, config: ApiConfig) {
  return (token: string): RestClient => new RestClient(name, config, token)
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
    raw = false,
    ignore404 = false,
  }: GetRequest): Promise<T> {
    logger.info(`Get using user credentials: calling ${this.name}: ${path} ${query}`)
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

      return raw ? result : result.body
    } catch (error) {
      if (ignore404 && error.response?.status === 404) {
        logger.info(`Returned null for 404 not found when calling ${this.name}: ${path}`)
        return null
      }
      const sanitisedError = sanitiseError(error, endpoint)
      logger.warn({ ...sanitisedError, query }, `Error calling ${this.name}, path: '${path}', verb: 'GET'`)
      throw sanitisedError
    }
  }

  async post<T>({
    path = null,
    query = '',
    headers = {},
    responseType = '',
    data = {},
    raw = false,
  }: PostRequest = {}): Promise<T> {
    logger.info(`Post using user credentials: calling ${this.name}: ${path}`)
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

      return raw ? result : result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error, endpoint)
      logger.warn({ ...sanitisedError }, `Error calling ${this.name}, path: '${path}', verb: 'POST'`)
      throw sanitisedError
    }
  }

  async put<T>({
    path = null,
    query = '',
    headers = {},
    responseType = '',
    data = {},
    raw = false,
  }: PutRequest = {}): Promise<T> {
    logger.info(`Put using user credentials: calling ${this.name}: ${path}`)
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

      return raw ? result : result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error, endpoint)
      logger.warn({ ...sanitisedError }, `Error calling ${this.name}, path: '${path}', verb: 'PUT'`)
      throw sanitisedError
    }
  }

  async patch<T>({
    path = null,
    query = '',
    headers = {},
    responseType = '',
    data = {},
    raw = false,
  }: PutRequest = {}): Promise<T> {
    logger.info(`Put using user credentials: calling ${this.name}: ${path}`)
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

      return raw ? result : result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error, endpoint)
      logger.warn({ ...sanitisedError }, `Error calling ${this.name}, path: '${path}', verb: 'PATCH'`)
      throw sanitisedError
    }
  }

  async stream({ path = null, headers = {} }: StreamRequest = {}): Promise<Readable> {
    logger.info(`Get using user credentials: calling ${this.name}: ${path}`)
    const endpoint = `${this.apiUrl()}${path}`
    return new Promise((resolve, reject) => {
      superagent
        .get(endpoint)
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
}
