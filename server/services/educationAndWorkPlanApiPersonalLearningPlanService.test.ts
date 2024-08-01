import createError from 'http-errors'
import { aValidGetGoalsResponse } from '../data/localMockData/getGoalsResponse'
import personalLearningPlanActionPlanMapper from './mappers/personalLearningPlanActionPlanMapper'
import { aValidPersonalLearningPlanActionPlan } from '../data/localMockData/personalLearningPlanActionPlan'
import EducationAndWorkPlanApiPersonalLearningPlanService from './educationAndWorkPlanApiPersonalLearningPlanService'

jest.mock('./mappers/personalLearningPlanActionPlanMapper')

describe('EducationAndWorkPlanApiPersonalLearningPlanService', () => {
  const prisonerNumber = 'A1234BC'
  const systemToken = 'a-system-token'

  const personalLearningPlanActionPlanMapperMock = personalLearningPlanActionPlanMapper as jest.MockedFunction<
    typeof personalLearningPlanActionPlanMapper
  >

  const educationAndWorkPlanApiClientMock = {
    getActiveGoals: jest.fn(),
  }
  const service = new EducationAndWorkPlanApiPersonalLearningPlanService(() => educationAndWorkPlanApiClientMock)

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should get prisoner action plan given prisoner has a PLP action plan', async () => {
    // Given
    const apiGetGoalsResponse = aValidGetGoalsResponse()
    educationAndWorkPlanApiClientMock.getActiveGoals.mockResolvedValue(apiGetGoalsResponse)

    const expectedActionPlan = aValidPersonalLearningPlanActionPlan()
    personalLearningPlanActionPlanMapperMock.mockReturnValue(expectedActionPlan)

    // When
    const actual = await service.getPrisonerActionPlan(prisonerNumber, systemToken)

    // Then
    expect(actual).toEqual(expectedActionPlan)
    expect(educationAndWorkPlanApiClientMock.getActiveGoals).toHaveBeenCalledWith(prisonerNumber)
    expect(personalLearningPlanActionPlanMapperMock).toHaveBeenCalledWith(prisonerNumber, apiGetGoalsResponse)
  })

  it('should get empty prisoner action plan given prisoner does not have any goals in their PLP action plan', async () => {
    // Given
    const apiGetGoalsResponse = aValidGetGoalsResponse({ goals: [] })
    educationAndWorkPlanApiClientMock.getActiveGoals.mockResolvedValue(apiGetGoalsResponse)

    const expectedActionPlan = aValidPersonalLearningPlanActionPlan({ goals: [] })
    personalLearningPlanActionPlanMapperMock.mockReturnValue(expectedActionPlan)

    // When
    const actual = await service.getPrisonerActionPlan(prisonerNumber, systemToken)

    // Then
    expect(actual).toEqual(expectedActionPlan)
    expect(educationAndWorkPlanApiClientMock.getActiveGoals).toHaveBeenCalledWith(prisonerNumber)
    expect(personalLearningPlanActionPlanMapperMock).toHaveBeenCalledWith(prisonerNumber, apiGetGoalsResponse)
  })

  it('should get empty prisoner action plan given prisoner does not have a PLP action plan (service returns 404)', async () => {
    // Given
    educationAndWorkPlanApiClientMock.getActiveGoals.mockRejectedValue(createError(404, 'Service unavailable'))

    const expectedActionPlan = aValidPersonalLearningPlanActionPlan({ goals: [] })
    personalLearningPlanActionPlanMapperMock.mockReturnValue(expectedActionPlan)

    // When
    const actual = await service.getPrisonerActionPlan(prisonerNumber, systemToken)

    // Then
    expect(actual).toEqual(expectedActionPlan)
    expect(educationAndWorkPlanApiClientMock.getActiveGoals).toHaveBeenCalledWith(prisonerNumber)
    expect(personalLearningPlanActionPlanMapperMock).not.toHaveBeenCalledWith({ goals: [] })
  })

  it('should not get prisoner action plan given PLP API throws an error', async () => {
    // Given
    const actionPlanApiError = {
      status: 501,
      data: {
        status: 501,
        userMessage: 'An unexpected error occurred',
        developerMessage: 'An unexpected error occurred',
      },
    }
    educationAndWorkPlanApiClientMock.getActiveGoals.mockRejectedValue(actionPlanApiError)

    const expectedActionPlan = { problemRetrievingData: true }

    // When
    const actual = await service.getPrisonerActionPlan(prisonerNumber, systemToken)

    // Then
    expect(actual).toEqual(expectedActionPlan)
    expect(educationAndWorkPlanApiClientMock.getActiveGoals).toHaveBeenCalledWith(prisonerNumber)
    expect(personalLearningPlanActionPlanMapperMock).not.toHaveBeenCalled()
  })
})
