import dummyScheduledEvents from '../data/localMockData/eventsForToday'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import {
  accountBalancesMock,
  assessmentsMock,
  visitBalancesMock,
  visitSummaryMock,
} from '../data/localMockData/miniSummaryMock'

import { prisonerDetailMock } from '../data/localMockData/prisonerDetailMock'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import { personalCareNeedsMock } from '../data/localMockData/personalCareNeedsMock'
import WorkAndSkillsPageService from './workAndSkillsPageService'
import { OffenderActivitiesMock } from '../data/localMockData/offenderActivitiesMock'
import { OffenderAttendanceHistoryMock } from '../data/localMockData/offenderAttendanceHistoryMock'
import { learnerEmployabilitySkills } from '../data/localMockData/learnerEmployabilitySkills'
import { LearnerLatestAssessmentsMock } from '../data/localMockData/learnerLatestAssessmentsMock'
import aValidLearnerGoals from '../data/localMockData/learnerGoalsMock'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import CuriousGoals from './interfaces/workAndSkillsPageService/CuriousGoals'
import toCuriousGoals from './mappers/curiousGoalsMapper'
import EducationAndWorkPlanApiPersonalLearningPlanService from './educationAndWorkPlanApiPersonalLearningPlanService'
import { Result } from '../utils/result/result'
import { LearnerLatestAssessmentsSummary } from '../data/localMockData/learnerLatestAssessmentsSummary'

jest.mock('./mappers/curiousGoalsMapper')
jest.mock('./educationAndWorkPlanApiPersonalLearningPlanService')
jest.mock('./curiousService')

describe('WorkAndSkillsService', () => {
  const curiousGoalsMapperMock = toCuriousGoals as jest.MockedFunction<typeof toCuriousGoals>

  const prisonApiClient = prisonApiClientMock()
  prisonApiClient.getAccountBalances = jest.fn(async () => accountBalancesMock)
  prisonApiClient.getAssessments = jest.fn(async () => assessmentsMock)
  prisonApiClient.getEventsScheduledForToday = jest.fn(async () => dummyScheduledEvents)
  prisonApiClient.getInmateDetail = jest.fn(async () => inmateDetailMock)
  prisonApiClient.getOffenderActivitiesHistory = jest.fn(async () => OffenderActivitiesMock)
  prisonApiClient.getOffenderAttendanceHistory = jest.fn(async () => OffenderAttendanceHistoryMock())
  prisonApiClient.getPersonalCareNeeds = jest.fn(async () => personalCareNeedsMock)
  prisonApiClient.getPrisoner = jest.fn(async () => prisonerDetailMock)
  prisonApiClient.getVisitBalances = jest.fn(async () => visitBalancesMock)
  prisonApiClient.getVisitSummary = jest.fn(async () => visitSummaryMock)

  const curiousApiClientMock = (prisonerNumber: string = 'ABC123') => {
    const learnerGoals = aValidLearnerGoals({
      prn: prisonerNumber,
      employmentGoals: ['An employment goal'],
      personalGoals: ['A personal goal'],
      shortTermGoals: ['A short term goal'],
      longTermGoals: ['A long term goal'],
    })
    return {
      getLearnerEmployabilitySkills: jest.fn(async () => learnerEmployabilitySkills),
      getLearnerProfile: jest.fn(),
      getLearnerEducationPage: jest.fn(),
      getLearnerLatestAssessments: jest.fn(async () => LearnerLatestAssessmentsMock),
      getLearnerGoals: jest.fn(async () => learnerGoals),
      getLearnerNeurodivergence: jest.fn(),
    }
  }

  let curiousApiClient = curiousApiClientMock()

  const personalLearningPlanService = new EducationAndWorkPlanApiPersonalLearningPlanService(
    null,
  ) as jest.Mocked<EducationAndWorkPlanApiPersonalLearningPlanService>

  const workAndSkillsPageServiceConstruct = jest.fn(() => {
    return new WorkAndSkillsPageService(
      () => curiousApiClient,
      () => prisonApiClient,
      personalLearningPlanService,
    )
  })

  const prisonerNumber = 'ABC123'

  const expectedCuriousGoals: CuriousGoals = {
    prisonerNumber,
    employmentGoals: [{ key: { text: 'An employment goal' }, value: { text: '' } }],
    personalGoals: [{ key: { text: 'A personal goal' }, value: { text: '' } }],
    shortTermGoals: [{ key: { text: 'A short term goal' }, value: { text: '' } }],
    longTermGoals: [{ key: { text: 'A long term goal' }, value: { text: '' } }],
  }

  const emptyCuriousGoals: CuriousGoals = {
    prisonerNumber,
    employmentGoals: [],
    personalGoals: [],
    shortTermGoals: [],
    longTermGoals: [],
  }

  const expectedUnacceptedAbsences = {
    unacceptableAbsenceLastMonth: 0,
    unacceptableAbsenceLastSixMonths: 0,
  }

  const expectedActivitiesHistory = {
    activitiesHistory: [
      {
        key: {
          text: 'Braille am',
        },
        value: {
          text: 'Started on 7 October 2021',
        },
      },
      {
        key: {
          text: 'Bricks PM',
        },
        value: {
          text: 'Started on 7 October 2021',
        },
      },
    ],
  }

  const curiousApiError = {
    status: 501,
    data: {
      status: 501,
      userMessage: 'An unexpected error occurred',
      developerMessage: 'An unexpected error occurred',
    },
  }

  const expectedWorkAndSkills = {
    learnerEmployabilitySkills: Result.fulfilled(learnerEmployabilitySkills).toPromiseSettledResult(),
    learnerLatestAssessments: Result.fulfilled(LearnerLatestAssessmentsSummary).toPromiseSettledResult(),
    curiousGoals: Result.fulfilled(expectedCuriousGoals).toPromiseSettledResult(),
    workAndSkillsPrisonerName: ' ',
    offenderActivitiesHistory: expectedActivitiesHistory,
    unacceptableAbsences: expectedUnacceptedAbsences,
  }

  describe('Work and skills', () => {
    beforeEach(() => {
      jest.clearAllMocks()
      curiousApiClient = curiousApiClientMock()
    })

    it('should return the work and skills details for the prisoner', async () => {
      const workAndSkillsPageService = workAndSkillsPageServiceConstruct()
      curiousGoalsMapperMock.mockReturnValue(expectedCuriousGoals)

      const res = await workAndSkillsPageService.get('token', { prisonerNumber } as Prisoner)

      expect(res).toEqual(expectedWorkAndSkills)
    })

    describe('Curious goals', () => {
      beforeEach(() => {
        jest.clearAllMocks()
        curiousApiClient = curiousApiClientMock()
      })

      // The Curious API appears inconsistent in it's handling of prisoners without Goals
      // Some prisoners have a 200 response body returned containing empty arrays
      // Whilst others get a 404 response (which the API client class ignores and returns a null to the service)
      it('should return empty CuriousGoals if the Curious goals API returns a 404 which is returned to the service as a null', async () => {
        const workAndSkillsPageService = workAndSkillsPageServiceConstruct()
        curiousApiClient.getLearnerGoals = jest.fn().mockReturnValue(null)

        const res = await workAndSkillsPageService.get('token', { prisonerNumber } as Prisoner)

        expect(res).toEqual({
          ...expectedWorkAndSkills,
          curiousGoals: Result.fulfilled(emptyCuriousGoals).toPromiseSettledResult(),
        })
      })

      it('should return empty CuriousGoals if the Curious goals API returns an empty response', async () => {
        const workAndSkillsPageService = workAndSkillsPageServiceConstruct()
        const emptyLearnerGoals = aValidLearnerGoals({
          prn: prisonerNumber,
          employmentGoals: [],
          personalGoals: [],
          shortTermGoals: [],
          longTermGoals: [],
        })
        curiousApiClient.getLearnerGoals = jest.fn().mockReturnValue(emptyLearnerGoals)
        curiousGoalsMapperMock.mockReturnValue(emptyCuriousGoals)

        const res = await workAndSkillsPageService.get('token', { prisonerNumber } as Prisoner)

        expect(res).toEqual({
          ...expectedWorkAndSkills,
          curiousGoals: Result.fulfilled(emptyCuriousGoals).toPromiseSettledResult(),
        })
      })

      it('should handle Curious API failure', async () => {
        const workAndSkillsPageService = workAndSkillsPageServiceConstruct()
        const apiErrorCallback = jest.fn()
        curiousApiClient.getLearnerGoals = jest.fn().mockRejectedValue(curiousApiError)

        const res = await workAndSkillsPageService.get('token', { prisonerNumber } as Prisoner, apiErrorCallback)

        expect(res).toEqual({
          ...expectedWorkAndSkills,
          curiousGoals: Result.rejected(curiousApiError).toPromiseSettledResult(),
        })
        expect(apiErrorCallback).toHaveBeenCalledWith(curiousApiError)
      })
    })

    describe('Learner employability skills', () => {
      beforeEach(() => {
        jest.clearAllMocks()
        curiousApiClient = curiousApiClientMock()
      })

      it('should handle a 404 from the Curious API, which is presented to the service as null', async () => {
        const workAndSkillsPageService = workAndSkillsPageServiceConstruct()
        curiousGoalsMapperMock.mockReturnValue(expectedCuriousGoals)
        curiousApiClient.getLearnerEmployabilitySkills = jest.fn().mockReturnValue(null)

        const res = await workAndSkillsPageService.get('token', { prisonerNumber } as Prisoner)

        expect(res).toEqual({
          ...expectedWorkAndSkills,
          learnerEmployabilitySkills: Result.fulfilled(null).toPromiseSettledResult(),
        })
      })

      it('should handle Curious API failure', async () => {
        const workAndSkillsPageService = workAndSkillsPageServiceConstruct()
        curiousGoalsMapperMock.mockReturnValue(expectedCuriousGoals)
        const apiErrorCallback = jest.fn()
        curiousApiClient.getLearnerEmployabilitySkills = jest.fn().mockRejectedValue(curiousApiError)

        const res = await workAndSkillsPageService.get('token', { prisonerNumber } as Prisoner, apiErrorCallback)

        expect(res).toEqual({
          ...expectedWorkAndSkills,
          learnerEmployabilitySkills: Result.rejected(curiousApiError).toPromiseSettledResult(),
        })
        expect(apiErrorCallback).toHaveBeenCalledWith(curiousApiError)
      })
    })

    describe('Learner latest assessments', () => {
      beforeEach(() => {
        jest.clearAllMocks()
        curiousApiClient = curiousApiClientMock()
      })

      it('should handle a 404 from the Curious API, which is presented to the service as null', async () => {
        const workAndSkillsPageService = workAndSkillsPageServiceConstruct()
        curiousGoalsMapperMock.mockReturnValue(expectedCuriousGoals)
        curiousApiClient.getLearnerLatestAssessments = jest.fn().mockReturnValue(null)

        const res = await workAndSkillsPageService.get('token', { prisonerNumber } as Prisoner)

        expect(res).toEqual({
          ...expectedWorkAndSkills,
          learnerLatestAssessments: Result.fulfilled([]).toPromiseSettledResult(),
        })
      })

      it('should handle Curious API failure', async () => {
        const workAndSkillsPageService = workAndSkillsPageServiceConstruct()
        curiousGoalsMapperMock.mockReturnValue(expectedCuriousGoals)
        const apiErrorCallback = jest.fn()
        curiousApiClient.getLearnerLatestAssessments = jest.fn().mockRejectedValue(curiousApiError)

        const res = await workAndSkillsPageService.get('token', { prisonerNumber } as Prisoner, apiErrorCallback)

        expect(res).toEqual({
          ...expectedWorkAndSkills,
          learnerLatestAssessments: Result.rejected(curiousApiError).toPromiseSettledResult(),
        })
        expect(apiErrorCallback).toHaveBeenCalledWith(curiousApiError)
      })
    })
  })
})
