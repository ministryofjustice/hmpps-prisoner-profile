import NomisSyncLocation from './NomisSyncLocation'

export interface NomisSyncPrisonerMappingApiClient {
  getMappingUsingNomisLocationId(id: number): Promise<NomisSyncLocation>
}
