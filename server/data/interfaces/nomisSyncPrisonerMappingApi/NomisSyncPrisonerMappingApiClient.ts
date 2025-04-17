import NomisSyncLocation from './NomisSyncLocation'

export interface NomisSyncPrisonerMappingApiClient {
  getMappingUsingDpsLocationId(id: string): Promise<NomisSyncLocation>
  getMappingUsingNomisLocationId(id: number): Promise<NomisSyncLocation>
  getMappingUsingDpsLocationId(id: string): Promise<NomisSyncLocation>
}
