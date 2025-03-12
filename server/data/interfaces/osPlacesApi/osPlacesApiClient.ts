import OsPlacesQueryResponse from './osPlacesQueryResponse'

export interface OsPlacesApiClient {
  getAddressesByFreeTextQuery(freeTextQuery: string): Promise<OsPlacesQueryResponse>
}
