import { aValidActionPlanResponse } from '../data/localMockData/actionPlanResponse'
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
    getPrisonerActionPlan: jest.fn(),
  }
  const service = new EducationAndWorkPlanApiPersonalLearningPlanService(() => educationAndWorkPlanApiClientMock)

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should get prisoner action plan given prisoner has a PLP action plan', async () => {
    // Given
    const apiActionPlanResponse = aValidActionPlanResponse()
    educationAndWorkPlanApiClientMock.getPrisonerActionPlan.mockResolvedValue(apiActionPlanResponse)

    const expectedActionPlan = aValidPersonalLearningPlanActionPlan()
    personalLearningPlanActionPlanMapperMock.mockReturnValue(expectedActionPlan)

    // When
    const actual = await service.getPrisonerActionPlan(prisonerNumber, systemToken)

    // Then
    expect(actual).toEqual(expectedActionPlan)
    expect(educationAndWorkPlanApiClientMock.getPrisonerActionPlan).toHaveBeenCalledWith(prisonerNumber)
    expect(personalLearningPlanActionPlanMapperMock).toHaveBeenCalledWith(apiActionPlanResponse)
  })

  it('should get empty prisoner action plan given prisoner does not have a PLP action plan', async () => {
    // Given
    const apiActionPlanResponse = aValidActionPlanResponse({ goals: [] }) // PLP API does not return a 404, it returns a response regardless, but with an empty goals collection
    educationAndWorkPlanApiClientMock.getPrisonerActionPlan.mockResolvedValue(apiActionPlanResponse)

    const expectedActionPlan = aValidPersonalLearningPlanActionPlan({ goals: [] })
    personalLearningPlanActionPlanMapperMock.mockReturnValue(expectedActionPlan)

    // When
    const actual = await service.getPrisonerActionPlan(prisonerNumber, systemToken)

    // Then
    expect(actual).toEqual(expectedActionPlan)
    expect(educationAndWorkPlanApiClientMock.getPrisonerActionPlan).toHaveBeenCalledWith(prisonerNumber)
    expect(personalLearningPlanActionPlanMapperMock).toHaveBeenCalledWith(apiActionPlanResponse)
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
    educationAndWorkPlanApiClientMock.getPrisonerActionPlan.mockRejectedValue(actionPlanApiError)

    const expectedActionPlan = { problemRetrievingData: true }

    // When
    const actual = await service.getPrisonerActionPlan(prisonerNumber, systemToken)

    // Then
    expect(actual).toEqual(expectedActionPlan)
    expect(educationAndWorkPlanApiClientMock.getPrisonerActionPlan).toHaveBeenCalledWith(prisonerNumber)
    expect(personalLearningPlanActionPlanMapperMock).not.toHaveBeenCalled()
  })
})
