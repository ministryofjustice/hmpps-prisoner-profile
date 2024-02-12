import { AdjudicationsApiClient } from '../../server/data/interfaces/adjudicationsApiClient'

export const adjudicationsApiClientMock = (): AdjudicationsApiClient => ({
  getAdjudications: jest.fn(),
})
