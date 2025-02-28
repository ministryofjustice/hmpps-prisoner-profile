import nock from 'nock'
import config from '../config'
import CuriousApiClient from './curiousApiClient'
import { learnerEmployabilitySkills } from './localMockData/learnerEmployabilitySkills'
import aValidLearnerGoals from './localMockData/learnerGoalsMock'
import { LearnerLatestAssessmentsMock } from './localMockData/learnerLatestAssessmentsMock'
import { LearnerNeurodivergenceMock } from './localMockData/learnerNeurodivergenceMock'
import { LearnerProfiles } from './localMockData/learnerProfiles'
import { LearnerEductionPagedResponse } from './interfaces/curiousApi/LearnerEducation'
import { learnerEducationPagedResponsePage1Of1 } from './localMockData/learnerEducationPagedResponse'

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

  describe('getLearnerEducationPage', () => {
    it('should get learner eduction page', async () => {
      // Given
      const prisonNumber = 'A1234BC'
      const page = 0

      const learnerEducationPage1Of1: LearnerEductionPagedResponse = learnerEducationPagedResponsePage1Of1(prisonNumber)
      fakeCuriousApi
        .get(`/learnerEducation/${prisonNumber}?page=${page}`)
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, learnerEducationPage1Of1)

      // When
      const actual = await curiousApiClient.getLearnerEducationPage(prisonNumber, page)

      // Then
      expect(actual).toEqual(learnerEducationPage1Of1)
      expect(nock.isDone()).toBe(true)
    })

    it('should not get learner education page given the API returns a 404 response', async () => {
      // Given
      const prisonNumber = 'A1234BC'
      const page = 0

      fakeCuriousApi
        .get(`/learnerEducation/${prisonNumber}?page=${page}`)
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(404, 'Not found')

      // When
      const actual = await curiousApiClient.getLearnerEducationPage(prisonNumber, page)

      // Then
      expect(actual).toBe(null)
      expect(nock.isDone()).toBe(true)
    })

    it('should not get learner education page given the API returns an error response', async () => {
      // Given
      const prisonNumber = 'A1234BC'
      const page = 0

      const expectedResponseBody = {
        errorCode: 'VC4001',
        errorMessage: 'Invalid token',
        httpStatusCode: 401,
      }
      fakeCuriousApi
        .get(`/learnerEducation/${prisonNumber}?page=${page}`)
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(401, expectedResponseBody)

      // When
      try {
        await curiousApiClient.getLearnerEducationPage(prisonNumber, page)
      } catch (e) {
        // Then
        expect(nock.isDone()).toBe(true)
        expect(e.status).toEqual(401)
        expect(e.data).toEqual(expectedResponseBody)
      }
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
