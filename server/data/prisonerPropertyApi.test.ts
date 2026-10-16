import nock from 'nock'
import config from '../config'
import PrisonerPropertyApiRestClient from './prisonerPropertyApiClient'
import { propertySummaryMock } from './localMockData/prisonerPropertySummaryMock'

const token = { access_token: 'token-1', expires_in: 300 }
const samplePrisonerNumber = 'G6123VU'

describe('prisonerPropertyApiClient', () => {
  let fakePrisonerPropertyApi: nock.Scope
  let prisonerPropertyApiClient: PrisonerPropertyApiRestClient

  beforeEach(() => {
    fakePrisonerPropertyApi = nock(config.apis.prisonerPropertyApi.url)
    prisonerPropertyApiClient = new PrisonerPropertyApiRestClient(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('getPrisonerPropertySummary', () => {
    it('should return the summary from the api', async () => {
      fakePrisonerPropertyApi
        .get(`/property-containers/prisoner/${samplePrisonerNumber}/summary`)
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, propertySummaryMock)

      const response = await prisonerPropertyApiClient.getPrisonerPropertySummary(samplePrisonerNumber)

      expect(response).toEqual(propertySummaryMock)
    })
  })
})
