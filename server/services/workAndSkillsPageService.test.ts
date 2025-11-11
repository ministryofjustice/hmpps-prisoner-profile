import dummyScheduledEvents from '../data/localMockData/eventsForToday'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import {
  accountBalancesMock,
  assessmentsMock,
  visitBalancesMock,
  visitSummaryMock,
} from '../data/localMockData/miniSummaryMock'

import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import { personalCareNeedsMock } from '../data/localMockData/personalCareNeedsMock'
import WorkAndSkillsPageService, { WorkAndSkillsData } from './workAndSkillsPageService'
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
import { PersonalLearningPlanActionPlan } from './interfaces/educationAndWorkPlanApiPersonalLearningPlanService/PersonalLearningPlanGoals'

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
  prisonApiClient.getVisitBalances = jest.fn(async () => visitBalancesMock)
  prisonApiClient.getVisitSummary = jest.fn(async () => visitSummaryMock)

  const curiousApiClientMock = (prisonerNumber: string = 'A1234BC') => {
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
  personalLearningPlanService.getPrisonerActionPlan = jest.fn().mockReturnValue(null)

  const workAndSkillsPageServiceConstruct = jest.fn(() => {
    return new WorkAndSkillsPageService(
      () => curiousApiClient,
      () => prisonApiClient,
      personalLearningPlanService,
      () => Promise.resolve({ curiousApiToken: 'token' }),
    )
  })

  const prisonerNumber = 'A1234BC'

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

  const curiousApiError: Error = {
    name: 'unexpected error',
    message: 'An unexpected error occurred',
  }

  const expectedWorkAndSkills: WorkAndSkillsData = {
    learnerEmployabilitySkills: Result.fulfilled(learnerEmployabilitySkills),
    learnerLatestAssessments: Result.fulfilled(LearnerLatestAssessmentsSummary),
    curiousGoals: Result.fulfilled(expectedCuriousGoals),
    workAndSkillsPrisonerName: ' ',
    offenderActivitiesHistory: expectedActivitiesHistory,
    unacceptableAbsences: expectedUnacceptedAbsences,
    personalLearningPlanActionPlan: null as PersonalLearningPlanActionPlan,
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

      responseAssertions(res)
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

        responseAssertions(res, {
          ...expectedWorkAndSkills,
          curiousGoals: Result.fulfilled(emptyCuriousGoals),
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

        responseAssertions(res, {
          ...expectedWorkAndSkills,
          curiousGoals: Result.fulfilled(emptyCuriousGoals),
        })
      })

      it('should handle Curious API failure', async () => {
        const workAndSkillsPageService = workAndSkillsPageServiceConstruct()
        const apiErrorCallback = jest.fn()
        curiousApiClient.getLearnerGoals = jest.fn().mockRejectedValue(curiousApiError)

        const res = await workAndSkillsPageService.get('token', { prisonerNumber } as Prisoner, apiErrorCallback)

        responseAssertions(res, {
          ...expectedWorkAndSkills,
          curiousGoals: Result.rejected(curiousApiError),
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

        responseAssertions(res, {
          ...expectedWorkAndSkills,
          learnerEmployabilitySkills: Result.fulfilled(null),
        })
      })

      it('should handle Curious API failure', async () => {
        const workAndSkillsPageService = workAndSkillsPageServiceConstruct()
        curiousGoalsMapperMock.mockReturnValue(expectedCuriousGoals)
        const apiErrorCallback = jest.fn()
        curiousApiClient.getLearnerEmployabilitySkills = jest.fn().mockRejectedValue(curiousApiError)

        const res = await workAndSkillsPageService.get('token', { prisonerNumber } as Prisoner, apiErrorCallback)

        responseAssertions(res, {
          ...expectedWorkAndSkills,
          learnerEmployabilitySkills: Result.rejected(curiousApiError),
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

        responseAssertions(res, {
          ...expectedWorkAndSkills,
          learnerLatestAssessments: Result.fulfilled([]),
        })
      })

      it('should handle Curious API failure', async () => {
        const workAndSkillsPageService = workAndSkillsPageServiceConstruct()
        curiousGoalsMapperMock.mockReturnValue(expectedCuriousGoals)
        const apiErrorCallback = jest.fn()
        curiousApiClient.getLearnerLatestAssessments = jest.fn().mockRejectedValue(curiousApiError)

        const res = await workAndSkillsPageService.get('token', { prisonerNumber } as Prisoner, apiErrorCallback)

        responseAssertions(res, {
          ...expectedWorkAndSkills,
          learnerLatestAssessments: Result.rejected(curiousApiError),
        })
        expect(apiErrorCallback).toHaveBeenCalledWith(curiousApiError)
      })
    })
  })

  const responseAssertions = (actual: WorkAndSkillsData, expected: WorkAndSkillsData = expectedWorkAndSkills) => {
    expect(actual.workAndSkillsPrisonerName).toEqual(expected.workAndSkillsPrisonerName)
    expect(actual.offenderActivitiesHistory).toEqual(expected.offenderActivitiesHistory)
    expect(actual.unacceptableAbsences).toEqual(expected.unacceptableAbsences)
    expect(actual.personalLearningPlanActionPlan).toEqual(expected.personalLearningPlanActionPlan)

    expect(actual.curiousGoals.isFulfilled()).toEqual(expected.curiousGoals.isFulfilled())
    expect(actual.curiousGoals.getOrNull()).toEqual(expected.curiousGoals.getOrNull())
    expect(actual.learnerEmployabilitySkills.isFulfilled()).toEqual(expected.learnerEmployabilitySkills.isFulfilled())
    expect(actual.learnerEmployabilitySkills.getOrNull()).toEqual(expected.learnerEmployabilitySkills.getOrNull())
    expect(actual.learnerLatestAssessments.isFulfilled()).toEqual(expected.learnerLatestAssessments.isFulfilled())
    expect(actual.learnerLatestAssessments.getOrNull()).toEqual(expected.learnerLatestAssessments.getOrNull())
  }
})
