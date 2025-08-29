import config from '../config'
import RestClient from './restClient'

import { LocationsInsidePrisonApiClient } from './interfaces/locationsInsidePrisonApi/LocationsInsidePrisonApiClient'

import LocationsApiLocation from './interfaces/locationsInsidePrisonApi/LocationsApiLocation'
import LocationsAttributes from './interfaces/locationsInsidePrisonApi/LocationsAttributes'

export default class LocationsInsidePrisonApiRestClient extends RestClient implements LocationsInsidePrisonApiClient {
  constructor(token: string) {
    super('Locations inside prison API', config.apis.locationsInsidePrisonApi, token)
  }

  async getLocation(id: string): Promise<LocationsApiLocation> {
    return this.get<LocationsApiLocation>({ path: `/locations/${id}?formatLocalName=true` }, this.token)
  }

  async getLocationByKey(key: string): Promise<LocationsApiLocation> {
    return this.get<LocationsApiLocation>({ path: `/locations/key/${key}` }, this.token)
  }

  async getLocationAttributes(id: string): Promise<LocationsAttributes[]> {
    return this.get<LocationsAttributes[]>({ path: `/locations/${id}/attributes` }, this.token)
  }

  async getLocationsForAppointments(id: string): Promise<LocationsApiLocation[]> {
    return this.get<LocationsApiLocation[]>(
      {
        path: `/locations/prison/${id}/non-residential-usage-type/APPOINTMENT?sortByLocalName=true&formatLocalName=true`,
      },
      this.token,
    )
  }
}
