import superagent from 'superagent'
import { HttpsAgent } from 'agentkeepalive'
import config from '../config'
import { OsPlacesApiClient } from './interfaces/osPlacesApi/osPlacesApiClient'
import OsPlacesQueryResponse from './interfaces/osPlacesApi/osPlacesQueryResponse'
import logger from '../../logger'
import sanitiseError from '../sanitisedError'

export default class OsPlacesApiRestClient implements OsPlacesApiClient {
  private baseUrl: string

  private agent: HttpsAgent

  constructor() {
    this.baseUrl = config.apis.osPlacesApi.url
    this.agent = new HttpsAgent(config.apis.osPlacesApi.agent)
  }

  async getAddressesByPostcode(postcode: string): Promise<OsPlacesQueryResponse> {
    const queryParams: Record<string, string> = {
      postcode,
      key: config.apis.osPlacesApi.apiKey,
    }
    return this.get<Promise<OsPlacesQueryResponse>>('/postcode', queryParams)
  }

  async getAddressesByFreeTextQuery(freeTextQuery: string): Promise<OsPlacesQueryResponse> {
    const queryParams: Record<string, string> = {
      query: freeTextQuery,
      key: config.apis.osPlacesApi.apiKey,
    }

    return this.get<Promise<OsPlacesQueryResponse>>('/find', queryParams)
  }

  async get<T>(path: string, query: Record<string, string>): Promise<T> {
    const endpoint = `${this.baseUrl}${path}`
    try {
      const result = await superagent
        .get(endpoint)
        .agent(this.agent)
        .retry(2, (err, res) => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .query(query)
        .timeout(config.apis.osPlacesApi.timeout)

      return result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error, endpoint)
      logger.warn(sanitisedError, `Error calling OS Places API, path: '${path}', verb: 'GET'`)
      throw sanitisedError
    }
  }
}
