import superagent from 'superagent'
import config from '../config'
import { OsPlacesApiClient } from './interfaces/osPlacesApi/osPlacesApiClient'
import OsPlacesQueryResponse from './interfaces/osPlacesApi/osPlacesQueryResponse'
import logger from '../../logger'
import AddressLookupError from '../utils/addressLookupError'

export default class OsPlacesApiRestClient implements OsPlacesApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = config.apis.osPlacesApi.url
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
        .retry(2, (err, res) => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .query(query)
        .timeout(config.apis.osPlacesApi.timeout)

      return result.body
    } catch (error) {
      const errorMessage = `Error calling OS Places API: ${error.message}`
      const lookupError = new AddressLookupError(errorMessage, error.status, error.response ? error.response.body : {})
      logger.warn(lookupError, errorMessage)
      throw lookupError
    }
  }
}
