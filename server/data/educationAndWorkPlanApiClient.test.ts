import nock from 'nock'
import config from '../config'
import EducationAndWorkPlanApiRestClient from './educationAndWorkPlanApiClient'
import { aValidActionPlanResponseWithOneGoal } from './localMockData/actionPlanResponse'

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

  describe('getPrisonerActionPlan', () => {
    it('should get Action Plan', async () => {
      // Given
      const prisonerNumber = 'A1234BC'

      const expectedActionPlanResponse = aValidActionPlanResponseWithOneGoal()
      educationAndWorkPlanApi.get(`/action-plans/${prisonerNumber}`).reply(200, expectedActionPlanResponse)

      // When
      const actual = await educationAndWorkPlanClient.getPrisonerActionPlan(prisonerNumber)

      // Then
      expect(nock.isDone()).toBe(true)
      expect(actual).toEqual(expectedActionPlanResponse)
    })

    it('should not get Action Plan given API returns error response', async () => {
      // Given
      const prisonerNumber = 'A1234BC'

      const expectedResponseBody = {
        status: 501,
        userMessage: 'An unexpected error occurred',
        developerMessage: 'An unexpected error occurred',
      }
      educationAndWorkPlanApi.get(`/action-plans/${prisonerNumber}`).reply(501, expectedResponseBody)

      // When
      try {
        await educationAndWorkPlanClient.getPrisonerActionPlan(prisonerNumber)
      } catch (e) {
        // Then
        expect(nock.isDone()).toBe(true)
        expect(e.status).toEqual(501)
        expect(e.data).toEqual(expectedResponseBody)
      }
    })
  })
})
