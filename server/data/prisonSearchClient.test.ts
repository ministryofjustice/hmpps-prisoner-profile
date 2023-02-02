import nock from 'nock'
import config from '../config'
import { PrisonerMockDataA, PrisonerMockDataB } from './localMockData/prisonSearch'
import PrisonSearchClient from './prisonerSearchClient'

jest.mock('./tokenStore')

const token = { access_token: 'token-1', expires_in: 300 }

describe('prisonSearchClient', () => {
  let fakePrisonSearchApi: nock.Scope
  let prisonSearchClient: PrisonSearchClient

  beforeEach(() => {
    fakePrisonSearchApi = nock(config.apis.prisonSearchApi.url)
    prisonSearchClient = new PrisonSearchClient(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('getPrisonerDetails', () => {
    it('should return data from api', async () => {
      fakePrisonSearchApi
        .get('/prisoner/123123')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, PrisonerMockDataA)

      const output = await prisonSearchClient.getPrisonerDetails('123123')
      expect(output).toEqual(PrisonerMockDataA)
    })

    it('should not return data from api', async () => {
      fakePrisonSearchApi
        .get('/prisoner/abcdef')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, PrisonerMockDataB)

      const output = await prisonSearchClient.getPrisonerDetails('123123')
      expect(output).not.toEqual(PrisonerMockDataB)
    })
  })
})
