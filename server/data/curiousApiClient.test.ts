import nock from 'nock'
import config from '../config'
import CuriousApiClient from './curiousApiClient'
import { learnerEmployabilitySkills } from './localMockData/learnerEmployabilitySkills'
import { LearnerProfiles } from './localMockData/learnerProfiles'

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

  describe('getLearnerEmployabilitySkills', () => {
    it('should return data from api', async () => {
      fakeCuriousApi
        .get('/learnerEmployabilitySkills/G6123VU')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, learnerEmployabilitySkills)

      const output = await curiousApiClient.getLearnerEmployabilitySkills('G6123VU')
      expect(output).toEqual(learnerEmployabilitySkills)
    })
  })

  describe('getLearnerProfiles', () => {
    it('should return data from api', async () => {
      fakeCuriousApi
        .get('/learnerProfile/G6123VU')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, LearnerProfiles)

      const output = await curiousApiClient.getLearnerProfile('G6123VU')
      expect(output).toEqual(LearnerProfiles)
    })
  })
})
