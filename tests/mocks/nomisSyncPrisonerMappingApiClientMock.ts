import { NomisSyncPrisonerMappingApiClient } from '../../server/data/interfaces/nomisSyncPrisonerMappingApi/NomisSyncPrisonerMappingApiClient'

export const nomisSyncPrisonerMappingApiClientMock = (): NomisSyncPrisonerMappingApiClient => ({
  getMappingUsingNomisLocationId: jest.fn(),
})
