import CircuitBreaker from 'opossum'
import { NonAssociationsApiClient } from '../../server/data/interfaces/nonAssociationsApi/nonAssociationsApiClient'

export const nonAssociationsApiClientMock = (): NonAssociationsApiClient => ({
  getPrisonerNonAssociations: jest.fn(),
  breaker: {} as CircuitBreaker,
})
