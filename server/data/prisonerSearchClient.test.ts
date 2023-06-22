import nock from 'nock'
import config from '../config'
import { PrisonerMockDataA, PrisonerMockDataB } from './localMockData/prisoner'
import PrisonerSearchClient from './prisonerSearchClient'
import restClientBuilder from '.'

const token = { access_token: 'token-1', expires_in: 300 }

describe('prisonerSearchClient', () => {
  let fakePrisonerSearchApi: nock.Scope
  let prisonerSearchClient: PrisonerSearchClient

  beforeEach(() => {
    fakePrisonerSearchApi = nock(config.apis.prisonerSearchApi.url)
    prisonerSearchClient = restClientBuilder(
      'Prisoner Search Client',
      config.apis.prisonerSearchApi,
      PrisonerSearchClient,
    )(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('getPrisonerDetails', () => {
    it('should return data from api', async () => {
      fakePrisonerSearchApi
        .get('/prisoner/A8469DY')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, PrisonerMockDataA)

      const output = await prisonerSearchClient.getPrisonerDetails('A8469DY')
      expect(output).toEqual(PrisonerMockDataA)
    })

    it('should not return data from api', async () => {
      fakePrisonerSearchApi
        .get('/prisoner/123123d')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, PrisonerMockDataB)

      const output = await prisonerSearchClient.getPrisonerDetails('123123123')
      expect(output).not.toEqual(PrisonerMockDataB)
    })
  })
})
