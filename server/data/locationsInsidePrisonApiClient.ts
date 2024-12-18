import config from '../config'
import RestClient from './restClient'

import { LocationsInsidePrisonApiClient } from './interfaces/locationsInsidePrisonApi/LocationsInsidePrisonApiClient'

import LocationsApiLocation from './interfaces/locationsInsidePrisonApi/LocationsApiLocation'

export default class LocationsInsidePrisonApiRestClient implements LocationsInsidePrisonApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Locations inside prison API', config.apis.locationsInsidePrisonApi, token)
  }

  async getLocation(id: string): Promise<LocationsApiLocation> {
    return this.restClient.get<LocationsApiLocation>({ path: `/locations/${id}?formatLocalName=true` })
  }

  async getLocationsForAppointments(id: string): Promise<LocationsApiLocation[]> {
    return this.restClient.get<LocationsApiLocation[]>({
      path: `/locations/prison/${id}/non-residential-usage-type/APPOINTMENT?sortByLocalName=true&formatLocalName=true`,
    })
  }
}
