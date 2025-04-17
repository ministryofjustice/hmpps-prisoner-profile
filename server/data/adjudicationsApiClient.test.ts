import nock from 'nock'
import config from '../config'
import { adjudicationSummaryWithActiveMock } from './localMockData/miniSummaryMock'
import AdjudicationsApiRestClient from './adjudicationsApiClient'

const token = { access_token: 'token-1', expires_in: 300 }

describe('adjudicationsApiClient', () => {
  let adjudicationsApi: nock.Scope
  let adjudicationsApiClient: AdjudicationsApiRestClient

  beforeEach(() => {
    adjudicationsApi = nock(config.apis.adjudicationsApi.url)
    adjudicationsApiClient = new AdjudicationsApiRestClient(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  const mockSuccessfulAdjudicationsApiCall = <TReturnData>(url: string, returnData: TReturnData) => {
    adjudicationsApi.get(url).matchHeader('authorization', `Bearer ${token.access_token}`).reply(200, returnData)
  }

  describe('getReviews', () => {
    it('Should return data from the API', async () => {
      const bookingId = 123456
      mockSuccessfulAdjudicationsApiCall(`/adjudications/by-booking-id/${bookingId}`, adjudicationSummaryWithActiveMock)

      const output = await adjudicationsApiClient.getAdjudications(bookingId)
      expect(output).toEqual(adjudicationSummaryWithActiveMock)
    })
  })
})
