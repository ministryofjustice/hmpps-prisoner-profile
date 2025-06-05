import OsPlacesQueryResponse from './osPlacesQueryResponse'

export interface OsPlacesApiClient {
  getAddressesByFreeTextQuery(freeTextQuery: string): Promise<OsPlacesQueryResponse>
  getAddressesByUprn(uprn: string): Promise<OsPlacesQueryResponse>
}
