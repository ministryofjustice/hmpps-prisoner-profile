import OsPlacesQueryResult from './osPlacesQueryResult'
import OsPlacesResponseHeader from './osPlacesResponseHeader'

export default interface OsPlacesQueryResponse {
  header: OsPlacesResponseHeader
  results: OsPlacesQueryResult[]
}
