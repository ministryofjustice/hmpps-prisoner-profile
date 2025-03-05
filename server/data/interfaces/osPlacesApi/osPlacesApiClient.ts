import OsPlacesQueryResponse from './osPlacesQueryResponse'

export interface OsPlacesApiClient {
  getAddressesByPostcode(postcode: string): Promise<OsPlacesQueryResponse>

  getAddressesByFreeTextQuery(freeTextQuery: string): Promise<OsPlacesQueryResponse>
}
