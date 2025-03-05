import config from '../config'
import { OsPlacesApiClient } from './interfaces/osPlacesApi/osPlacesApiClient'
import OsPlacesQueryResponse from './interfaces/osPlacesApi/osPlacesQueryResponse'
import RestClient from './restClient'

export default class OsPlacesApiRestClient implements OsPlacesApiClient {
  private restClient: RestClient

  constructor() {
    this.restClient = new RestClient('OS Places API', config.apis.osPlacesApi, null)
  }

  async getAddressesByPostcode(postcode: string): Promise<OsPlacesQueryResponse> {
    const queryParams: Record<string, string> = {
      postcode,
      key: config.apis.osPlacesApi.apiKey,
    }
    return this.restClient.get<Promise<OsPlacesQueryResponse>>({ path: '/postcode', query: queryParams })
  }

  async getAddressesByFreeTextQuery(freeTextQuery: string): Promise<OsPlacesQueryResponse> {
    const queryParams: Record<string, string> = {
      query: freeTextQuery,
      key: config.apis.osPlacesApi.apiKey,
    }

    return this.restClient.get<Promise<OsPlacesQueryResponse>>({ path: '/find', query: queryParams })
  }
}
