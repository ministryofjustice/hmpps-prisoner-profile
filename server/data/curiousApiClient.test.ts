import nock from 'nock'
import config from '../config'
import CuriousApiClient from './curiousApiClient'
import { learnerEmployabilitySkills } from './localMockData/learnerEmployabilitySkills'

const token = { access_token: 'token-1', expires_in: 300 }

describe('curiousApiClient', () => {
  let fakeCuriousApi: nock.Scope
  let curiousApiClient: CuriousApiClient

  beforeEach(() => {
    fakeCuriousApi = nock(config.apis.curiousApiUrl.url)
    curiousApiClient = new CuriousApiClient(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('getPrisonerDetails', () => {
    it('should return data from api', async () => {
      fakeCuriousApi
        .get('/learnerEmployabilitySkills/A8469DY')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, learnerEmployabilitySkills)

      const output = await curiousApiClient.getLearnerEmployabilitySkills('A8469DY')
      expect(output).toEqual(learnerEmployabilitySkills)
    })
  })
})
