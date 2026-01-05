import type { SupportForAdditionalNeedsApiClient } from '../../server/data/interfaces/supportForAdditionalNeedsApi/supportForAdditionalNeedsApiClient'
import type { HasNeed } from '../../server/data/interfaces/supportForAdditionalNeedsApi/SupportForAdditionalNeeds'

export const supportForAdditionalNeedsApiClientMock = (): jest.Mocked<SupportForAdditionalNeedsApiClient> => ({
  hasNeedsForAdditionalSupport: jest.fn((prisonerNumber: string) =>
    Promise.resolve({
      hasNeed: false,
      url: `http://localhost:9091/supportForAdditionalNeedsUI/profile/${prisonerNumber}/overview`,
      modalUrl: `http://localhost:9091/supportForAdditionalNeedsUI/profile/${prisonerNumber}/overview/modal`,
    } satisfies HasNeed),
  ),
})

export default { supportForAdditionalNeedsApiClientMock }
