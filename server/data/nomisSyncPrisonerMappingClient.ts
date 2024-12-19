import config from '../config'
import RestClient from './restClient'

import { NomisSyncPrisonerMappingApiClient } from './interfaces/nomisSyncPrisonerMappingApi/NomisSyncPrisonerMappingApiClient'

import NomisSyncLocation from './interfaces/nomisSyncPrisonerMappingApi/NomisSyncLocation'

export default class NomisSyncPrisonMappingRestClient implements NomisSyncPrisonerMappingApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Nomis sync prisoner mapping API', config.apis.nomisSyncPrisonerMappingApi, token)
  }

  async getMappingUsingNomisLocationId(nomisLocationId: number): Promise<NomisSyncLocation> {
    return this.restClient.get({ path: `/api/locations/nomis/${nomisLocationId}` })
  }

  async getMappingUsingDpsLocationId(dpsLocationId: string): Promise<NomisSyncLocation> {
    return this.restClient.get({ path: `/api/locations/dps/${dpsLocationId}` })
  }
}
