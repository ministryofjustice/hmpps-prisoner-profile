import { AdjudicationsApiClient } from '../../server/data/interfaces/adjudicationsApiClient'

// eslint-disable-next-line import/prefer-default-export
export const adjudicationsApiClientMock = (): AdjudicationsApiClient => ({
  getAdjudications: jest.fn(),
})
