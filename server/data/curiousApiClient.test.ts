import nock from 'nock'
import config from '../config'
import CuriousApiClient from './curiousApiClient'
import { learnerEmployabilitySkills } from './localMockData/learnerEmployabilitySkills'
import aValidLearnerGoals from './localMockData/learnerGoalsMock'
import { LearnerNeurodivergenceMock } from './localMockData/learnerNeurodivergenceMock'
import { LearnerAssessmentsMock } from './localMockData/learnerAssessmentsMock'
import { LearnerQualificationsMock } from './localMockData/learnerQualificationsMock'

const token = { access_token: 'token-1', expires_in: 300 }

describe('curiousApiClient', () => {
  let fakeCuriousApi: nock.Scope
  let curiousApiClient: CuriousApiClient

  beforeEach(() => {
    fakeCuriousApi = nock(config.apis.curiousApiUrl.url)
    curiousApiClient = new CuriousApiClient({ curiousApiToken: token.access_token })
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

  describe('getLearnerGoals', () => {
    it('should return data from api', async () => {
      const expectedLearnerGoals = aValidLearnerGoals()
      fakeCuriousApi
        .get('/learnerGoals/G6123VU')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, expectedLearnerGoals)

      const output = await curiousApiClient.getLearnerGoals('G6123VU')
      expect(output).toEqual(expectedLearnerGoals)
    })
  })

  describe('getLearnerNeurodivergence', () => {
    it('should return data from api', async () => {
      fakeCuriousApi
        .get('/learnerNeurodivergence/G6123VU')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, LearnerNeurodivergenceMock)

      const output = await curiousApiClient.getLearnerNeurodivergence('G6123VU')
      expect(output).toEqual(LearnerNeurodivergenceMock)
    })
  })

  describe('getLearnerAssessments', () => {
    it('should return data from api', async () => {
      fakeCuriousApi
        .get('/learnerAssessments/v2/G6123VU')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, LearnerAssessmentsMock)

      const output = await curiousApiClient.getLearnerAssessments('G6123VU')
      expect(output).toEqual(LearnerAssessmentsMock)
    })

    it('should return null given api returns 404', async () => {
      fakeCuriousApi
        .get('/learnerAssessments/v2/G6123VU')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(404)

      const output = await curiousApiClient.getLearnerAssessments('G6123VU')
      expect(output).toBeNull()
    })
  })

  describe('getLearnerQualifications', () => {
    it('should return data from api', async () => {
      fakeCuriousApi
        .get('/learnerQualifications/v2/G6123VU')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, LearnerQualificationsMock)

      const output = await curiousApiClient.getLearnerQualifications('G6123VU')
      expect(output).toEqual(LearnerQualificationsMock)
    })

    it('should return null given api returns 404', async () => {
      fakeCuriousApi
        .get('/learnerQualifications/v2/G6123VU')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(404)

      const output = await curiousApiClient.getLearnerQualifications('G6123VU')
      expect(output).toBeNull()
    })
  })
})
