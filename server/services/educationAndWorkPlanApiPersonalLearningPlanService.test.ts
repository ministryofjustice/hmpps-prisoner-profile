import { parseISO } from 'date-fns'
import createError from 'http-errors'
import { aValidGetGoalsResponse } from '../data/localMockData/getGoalsResponse'
import aValidGetEmployabilitySkillResponses from '../data/localMockData/getEmployabilitySkillResponses'
import personalLearningPlanActionPlanMapper from './mappers/personalLearningPlanActionPlanMapper'
import personalLearningPlanEmployabilitySkillsMapper from './mappers/personalLearningPlanEmployabilitySkillsMapper'
import { aValidPersonalLearningPlanActionPlan } from '../data/localMockData/personalLearningPlanActionPlan'
import EducationAndWorkPlanApiPersonalLearningPlanService from './educationAndWorkPlanApiPersonalLearningPlanService'
import EducationAndWorkPlanApiRestClient from '../data/educationAndWorkPlanApiClient'
import { PersonalLearningPlanEmployabilitySkill } from './interfaces/educationAndWorkPlanApiPersonalLearningPlanService/PersonalLearningPlanViewModels'

jest.mock('./mappers/personalLearningPlanActionPlanMapper')
jest.mock('./mappers/personalLearningPlanEmployabilitySkillsMapper')
jest.mock('../data/educationAndWorkPlanApiClient')

describe('EducationAndWorkPlanApiPersonalLearningPlanService', () => {
  const prisonerNumber = 'A1234BC'
  const systemToken = 'a-system-token'

  const personalLearningPlanActionPlanMapperMock = personalLearningPlanActionPlanMapper as jest.MockedFunction<
    typeof personalLearningPlanActionPlanMapper
  >
  const personalLearningPlanEmployabilitySkillsMapperMock =
    personalLearningPlanEmployabilitySkillsMapper as jest.MockedFunction<
      typeof personalLearningPlanEmployabilitySkillsMapper
    >

  const educationAndWorkPlanApiClientMock = new EducationAndWorkPlanApiRestClient(
    null,
  ) as jest.Mocked<EducationAndWorkPlanApiRestClient>
  const service = new EducationAndWorkPlanApiPersonalLearningPlanService(() => educationAndWorkPlanApiClientMock)

  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('getPrisonerActionPlan', () => {
    it('should get prisoner action plan given prisoner has a PLP action plan', async () => {
      // Given
      const apiGetGoalsResponse = aValidGetGoalsResponse()
      educationAndWorkPlanApiClientMock.getAllGoals.mockResolvedValue(apiGetGoalsResponse)

      const expectedActionPlan = aValidPersonalLearningPlanActionPlan()
      personalLearningPlanActionPlanMapperMock.mockReturnValue(expectedActionPlan)

      // When
      const actual = await service.getPrisonerActionPlan(prisonerNumber, systemToken)

      // Then
      expect(actual).toEqual(expectedActionPlan)
      expect(educationAndWorkPlanApiClientMock.getAllGoals).toHaveBeenCalledWith(prisonerNumber)
      expect(personalLearningPlanActionPlanMapperMock).toHaveBeenCalledWith(prisonerNumber, apiGetGoalsResponse)
    })

    it('should get empty prisoner action plan given prisoner does not have any goals in their PLP action plan', async () => {
      // Given
      const apiGetGoalsResponse = aValidGetGoalsResponse({ goals: [] })
      educationAndWorkPlanApiClientMock.getAllGoals.mockResolvedValue(apiGetGoalsResponse)

      const expectedActionPlan = aValidPersonalLearningPlanActionPlan({
        activeGoals: [],
        archivedGoals: [],
        completedGoals: [],
      })
      personalLearningPlanActionPlanMapperMock.mockReturnValue(expectedActionPlan)

      // When
      const actual = await service.getPrisonerActionPlan(prisonerNumber, systemToken)

      // Then
      expect(actual).toEqual(expectedActionPlan)
      expect(educationAndWorkPlanApiClientMock.getAllGoals).toHaveBeenCalledWith(prisonerNumber)
      expect(personalLearningPlanActionPlanMapperMock).toHaveBeenCalledWith(prisonerNumber, apiGetGoalsResponse)
    })

    it('should get empty prisoner action plan given prisoner does not have a PLP action plan (service returns 404)', async () => {
      // Given
      educationAndWorkPlanApiClientMock.getAllGoals.mockRejectedValue(createError(404, 'Not found'))

      const expectedActionPlan = aValidPersonalLearningPlanActionPlan({
        activeGoals: [],
        archivedGoals: [],
        completedGoals: [],
      })
      personalLearningPlanActionPlanMapperMock.mockReturnValue(expectedActionPlan)

      // When
      const actual = await service.getPrisonerActionPlan(prisonerNumber, systemToken)

      // Then
      expect(actual).toEqual(expectedActionPlan)
      expect(educationAndWorkPlanApiClientMock.getAllGoals).toHaveBeenCalledWith(prisonerNumber)
      expect(personalLearningPlanActionPlanMapperMock).toHaveBeenCalledWith(prisonerNumber, { goals: [] })
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
      educationAndWorkPlanApiClientMock.getAllGoals.mockRejectedValue(actionPlanApiError)

      const expectedActionPlan = { problemRetrievingData: true }

      // When
      const actual = await service.getPrisonerActionPlan(prisonerNumber, systemToken)

      // Then
      expect(actual).toEqual(expectedActionPlan)
      expect(educationAndWorkPlanApiClientMock.getAllGoals).toHaveBeenCalledWith(prisonerNumber)
      expect(personalLearningPlanActionPlanMapperMock).not.toHaveBeenCalled()
    })
  })

  describe('getEmployabilitySkills', () => {
    it('should get employability skills given prisoner has employability skills', async () => {
      // Given
      const apiGetEmployabilitySkillsResponse = aValidGetEmployabilitySkillResponses()
      educationAndWorkPlanApiClientMock.getEmployabilitySkills.mockResolvedValue(apiGetEmployabilitySkillsResponse)

      const expectedEmployabilitySkills = [
        {
          employabilitySkillType: 'TEAMWORK',
          employabilitySkillRating: 'QUITE_CONFIDENT',
          evidence: 'Demonstrated in class',
          sessionType: 'EDUCATION_REVIEW',
          sessionTypeDescription: 'Maths class',
          createdBy: 'asmith_gen',
          createdByDisplayName: 'Alex Smith',
          createdAt: parseISO('2023-01-16T09:14:43.158Z'),
          updatedBy: 'asmith_gen',
          updatedByDisplayName: 'Alex Smith',
          updatedAt: parseISO('2023-09-23T14:43:02.094Z'),
        },
      ] as Array<PersonalLearningPlanEmployabilitySkill>
      personalLearningPlanEmployabilitySkillsMapperMock.mockReturnValue(expectedEmployabilitySkills)

      // When
      const actual = await service.getEmployabilitySkills(prisonerNumber, systemToken)

      // Then
      expect(actual).toEqual(expectedEmployabilitySkills)
      expect(educationAndWorkPlanApiClientMock.getEmployabilitySkills).toHaveBeenCalledWith(prisonerNumber)
      expect(personalLearningPlanEmployabilitySkillsMapperMock).toHaveBeenCalledWith(apiGetEmployabilitySkillsResponse)
    })

    it('should get empty employability skills given prisoner does not have any employability skills (service returns 404)', async () => {
      // Given
      educationAndWorkPlanApiClientMock.getEmployabilitySkills.mockRejectedValue(createError(404, 'Not found'))

      const expectedEmployabilitySkills = [] as Array<PersonalLearningPlanEmployabilitySkill>

      // When
      const actual = await service.getEmployabilitySkills(prisonerNumber, systemToken)

      // Then
      expect(actual).toEqual(expectedEmployabilitySkills)
      expect(educationAndWorkPlanApiClientMock.getEmployabilitySkills).toHaveBeenCalledWith(prisonerNumber)
      expect(personalLearningPlanEmployabilitySkillsMapperMock).not.toHaveBeenCalled()
    })

    it('should rethrow error given PLP API throws an error', async () => {
      // Given
      const employabilitySkillsApiError = {
        status: 501,
        data: {
          status: 501,
          userMessage: 'An unexpected error occurred',
          developerMessage: 'An unexpected error occurred',
        },
      }
      educationAndWorkPlanApiClientMock.getEmployabilitySkills.mockRejectedValue(employabilitySkillsApiError)

      // When
      const actual = await service.getEmployabilitySkills(prisonerNumber, systemToken).catch(e => e)

      // Then
      expect(actual).toEqual(employabilitySkillsApiError)
      expect(educationAndWorkPlanApiClientMock.getEmployabilitySkills).toHaveBeenCalledWith(prisonerNumber)
      expect(personalLearningPlanEmployabilitySkillsMapperMock).not.toHaveBeenCalled()
    })
  })
})
