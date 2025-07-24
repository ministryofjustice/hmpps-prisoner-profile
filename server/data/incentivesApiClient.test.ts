import nock from 'nock'
import config from '../config'
import IncentivesApiRestClient from './incentivesApiClient'
import { incentiveReviewsMock } from './localMockData/incentiveReviewsMock'

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
      const prisonerNumber = 'A1234AB'
      mockSuccessfulIncentivesApiCall(`/incentive-reviews/prisoner/${prisonerNumber}`, incentiveReviewsMock)

      const output = await incentivesApiClient.getReviews(prisonerNumber)
      expect(output).toEqual(incentiveReviewsMock)
    })
  })
})
