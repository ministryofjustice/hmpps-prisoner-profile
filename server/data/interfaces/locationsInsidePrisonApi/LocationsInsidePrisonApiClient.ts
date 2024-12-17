import LocationsApiLocation from './LocationsApiLocation'

export interface LocationsInsidePrisonApiClient {
  getLocation(locationId: string): Promise<LocationsApiLocation>
}
