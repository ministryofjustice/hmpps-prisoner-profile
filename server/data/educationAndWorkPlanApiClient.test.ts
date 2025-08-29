import nock from 'nock'
import config from '../config'
import EducationAndWorkPlanApiRestClient from './educationAndWorkPlanApiClient'
import { aValidGetGoalsResponseWithOneGoal } from './localMockData/getGoalsResponse'

describe('educationAndWorkPlanApiClient', () => {
  const systemToken = 'a-system-token'
  const educationAndWorkPlanClient = new EducationAndWorkPlanApiRestClient(systemToken)

  let educationAndWorkPlanApi: nock.Scope

  beforeEach(() => {
    educationAndWorkPlanApi = nock(config.apis.educationAndWorkPlanApi.url)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('getAllGoals', () => {
    it('should get all goals', async () => {
      // Given
      const prisonerNumber = 'A1234BC'

      const expectedGetGoalsResponse = aValidGetGoalsResponseWithOneGoal()
      educationAndWorkPlanApi //
        .get(`/action-plans/${prisonerNumber}/goals`)
        .reply(200, expectedGetGoalsResponse)

      // When
      const actual = await educationAndWorkPlanClient.getAllGoals(prisonerNumber)

      // Then
      expect(nock.isDone()).toBe(true)
      expect(actual).toEqual(expectedGetGoalsResponse)
    })

    it('should not get all goals given API returns error response', async () => {
      // Given
      const prisonerNumber = 'A1234BC'

      const expectedResponseBody = {
        status: 501,
        userMessage: 'An unexpected error occurred',
        developerMessage: 'An unexpected error occurred',
      }
      educationAndWorkPlanApi //
        .get(`/action-plans/${prisonerNumber}/goals`)
        .reply(501, expectedResponseBody)

      // When
      try {
        await educationAndWorkPlanClient.getAllGoals(prisonerNumber)
      } catch (e) {
        // Then
        expect(nock.isDone()).toBe(true)
        expect(e.responseStatus).toEqual(501)
        expect(e.data).toEqual(expectedResponseBody)
      }
    })
  })
})
