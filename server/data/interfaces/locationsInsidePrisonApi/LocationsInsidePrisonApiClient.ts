import LocationsApiLocation from './LocationsApiLocation'

export interface LocationsInsidePrisonApiClient {
  getLocation(locationId: string): Promise<LocationsApiLocation>
  getLocationByKey(locationKey: string): Promise<LocationsApiLocation>
  getLocationsForAppointments(prisonId: string): Promise<LocationsApiLocation[]>
}
