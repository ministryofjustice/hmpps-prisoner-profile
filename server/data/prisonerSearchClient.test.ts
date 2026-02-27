import nock from 'nock'
import config from '../config'
import { PrisonerMockDataA } from './localMockData/prisoner'
import PrisonerSearchClient from './prisonerSearchClient'

const token = { access_token: 'token-1', expires_in: 300 }

describe('prisonerSearchClient', () => {
  let fakePrisonerSearchApi: nock.Scope
  let prisonerSearchClient: PrisonerSearchClient

  beforeEach(() => {
    fakePrisonerSearchApi = nock(config.apis.prisonerSearchApi.url)
    prisonerSearchClient = new PrisonerSearchClient(token.access_token)
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

    it('should propagate errors from api', async () => {
      fakePrisonerSearchApi
        .get('/prisoner/A8469DY')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(404)

      await expect(prisonerSearchClient.getPrisonerDetails('A8469DY')).rejects.toThrow()
    })
  })
})
