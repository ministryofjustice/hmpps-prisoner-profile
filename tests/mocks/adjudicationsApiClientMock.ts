import AdjudicationsApiClient from '../../server/data/interfaces/adjudicationsApi/adjudicationsApiClient'

export const adjudicationsApiClientMock = (): AdjudicationsApiClient => ({
  getAdjudications: jest.fn(),
})
