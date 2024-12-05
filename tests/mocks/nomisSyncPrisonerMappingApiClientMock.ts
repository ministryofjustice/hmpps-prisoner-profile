import { NomisSyncPrisonerMappingApiClient } from '../../server/data/interfaces/nomisSyncPrisonerMappingApi/NomisSyncPrisonerMappingApiClient'

export const nomisSyncPrisonerMappingApiClientMock = (): NomisSyncPrisonerMappingApiClient => ({
  getMappingUsingDpsLocationId: jest.fn(),
  getMappingUsingNomisLocationId: jest.fn(),
})
