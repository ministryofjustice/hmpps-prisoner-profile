import type { PrisonerSearchClient } from '../../server/data/interfaces/prisonerSearchApi/prisonerSearchClient'
import { PrisonerMockDataA } from '../../server/data/localMockData/prisoner'

// eslint-disable-next-line import/prefer-default-export
export const prisonerSearchClientMock = (): jest.Mocked<PrisonerSearchClient> => ({
  getPrisonerDetails: jest.fn().mockResolvedValue(PrisonerMockDataA),
  findByNumbers: jest.fn(),
})
