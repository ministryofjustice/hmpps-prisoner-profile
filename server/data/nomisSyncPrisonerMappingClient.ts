import CircuitBreaker from 'opossum'
import config from '../config'
import RestClient, { Request } from './restClient'
import { NomisSyncPrisonerMappingApiClient } from './interfaces/nomisSyncPrisonerMappingApi/NomisSyncPrisonerMappingApiClient'
import NomisSyncLocation from './interfaces/nomisSyncPrisonerMappingApi/NomisSyncLocation'

export default class NomisSyncPrisonMappingRestClient extends RestClient implements NomisSyncPrisonerMappingApiClient {
  constructor(token: string, circuitBreaker?: CircuitBreaker<[Request<unknown, unknown>, string], unknown>) {
    super('Nomis sync prisoner mapping API', config.apis.nomisSyncPrisonerMappingApi, token, circuitBreaker)
  }

  async getMappingUsingNomisLocationId(nomisLocationId: number): Promise<NomisSyncLocation> {
    return this.get({ path: `/api/locations/nomis/${nomisLocationId}` }, this.token)
  }

  async getMappingUsingDpsLocationId(dpsLocationId: string): Promise<NomisSyncLocation> {
    return this.get({ path: `/api/locations/dps/${dpsLocationId}` }, this.token)
  }
}
