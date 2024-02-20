import nock from 'nock'
import config from '../config'
import IncentivesApiRestClient from './incentivesApiClient'
import { incentiveReviewsMock } from './localMockData/incentiveReviewsMock'

jest.mock('./tokenStore')

const token = { access_token: 'token-1', expires_in: 300 }

describe('caseNotesApiClient', () => {
  let incentivesApi: nock.Scope
  let incentivesApiClient: IncentivesApiRestClient

  beforeEach(() => {
    incentivesApi = nock(config.apis.incentivesApi.url)
    incentivesApiClient = new IncentivesApiRestClient(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  const mockSuccessfulIncentivesApiCall = <TReturnData>(url: string, returnData: TReturnData) => {
    incentivesApi.get(url).matchHeader('authorization', `Bearer ${token.access_token}`).reply(200, returnData)
  }

  describe('getReviews', () => {
    it('Should return data from the API', async () => {
      const bookingId = 123456
      mockSuccessfulIncentivesApiCall(`/incentive-reviews/booking/${bookingId}`, incentiveReviewsMock)

      const output = await incentivesApiClient.getReviewSummary(bookingId)
      expect(output).toEqual(incentiveReviewsMock)
    })
  })
})
