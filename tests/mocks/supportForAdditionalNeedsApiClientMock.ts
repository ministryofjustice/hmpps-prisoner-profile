import type { SupportForAdditionalNeedsApiClient } from '../../server/data/interfaces/supportForAdditionalNeedsApi/supportForAdditionalNeedsApiClient'

export const supportForAdditionalNeedsApiClientMock = (): jest.Mocked<SupportForAdditionalNeedsApiClient> => ({
  hasNeedsForAdditionalSupport: jest.fn(),
})

export default { supportForAdditionalNeedsApiClientMock }
