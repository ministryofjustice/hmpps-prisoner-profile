import LocationsApiLocation from './LocationsApiLocation'
import LocationsAttributes from './LocationsAttributes'

export interface LocationsInsidePrisonApiClient {
  getLocation(locationId: string): Promise<LocationsApiLocation>
  getLocationByKey(locationKey: string): Promise<LocationsApiLocation>
  getLocationsForAppointments(prisonId: string): Promise<LocationsApiLocation[]>
  getLocationAttributes(locationId: string): Promise<LocationsAttributes[]>
}
