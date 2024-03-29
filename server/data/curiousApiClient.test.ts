import nock from 'nock'
import config from '../config'
import CuriousApiClient from './curiousApiClient'
import { learnerEducation } from './localMockData/learnerEducation'
import { learnerEmployabilitySkills } from './localMockData/learnerEmployabilitySkills'
import aValidLearnerGoals from './localMockData/learnerGoalsMock'
import { LearnerLatestAssessmentsMock } from './localMockData/learnerLatestAssessmentsMock'
import { LearnerNeurodivergenceMock } from './localMockData/learnerNeurodivergenceMock'
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

  describe('getLearnerEducation', () => {
    it('should return data from api', async () => {
      fakeCuriousApi
        .get('/learnerEducation/G6123VU')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, learnerEducation)

      const output = await curiousApiClient.getLearnerEducation('G6123VU')
      expect(output).toEqual(learnerEducation)
    })
  })

  describe('getLearnerLatestAssessments', () => {
    it('should return data from api', async () => {
      fakeCuriousApi
        .get('/latestLearnerAssessments/G6123VU')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, LearnerLatestAssessmentsMock)

      const output = await curiousApiClient.getLearnerLatestAssessments('G6123VU')
      expect(output).toEqual(LearnerLatestAssessmentsMock)
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
})
