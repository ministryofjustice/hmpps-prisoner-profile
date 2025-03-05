import OsPlacesDeliveryPointAddress from './osPlacesDeliveryPointAddress'
import OsPlacesLandPropertyIdentifier from './osPlacesLandPropertyIdentifier'

export default interface OsPlacesQueryResult {
  DPA?: OsPlacesDeliveryPointAddress
  LPI?: OsPlacesLandPropertyIdentifier
}
