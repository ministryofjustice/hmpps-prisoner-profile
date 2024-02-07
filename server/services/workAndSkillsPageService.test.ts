import { format, startOfDay, subMonths } from 'date-fns'
import dummyScheduledEvents from '../data/localMockData/eventsForToday'
import { Prisoner } from '../interfaces/prisoner'
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
import { LearnerProfiles } from '../data/localMockData/learnerProfiles'
import { learnerEducation } from '../data/localMockData/learnerEducation'
import { LearnerLatestAssessmentsMock } from '../data/localMockData/learnerLatestAssessmentsMock'
import aValidLearnerGoals from '../data/localMockData/learnerGoalsMock'
import { LearnerNeurodivergenceMock } from '../data/localMockData/learnerNeurodivergenceMock'
import { pagedActiveAlertsMock } from '../data/localMockData/pagedAlertsMock'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import { CuriousGoals } from '../interfaces/curiousGoals'
import toCuriousGoals from '../interfaces/mappers/curiousGoalsMapper'

jest.mock('../interfaces/mappers/curiousGoalsMapper')

describe('WorkAndSkillsService', () => {
  const curiousGoalsMapperMock = toCuriousGoals as jest.MockedFunction<typeof toCuriousGoals>

  const prisonApiClient = prisonApiClientMock()
  prisonApiClient.getAccountBalances = jest.fn(async () => accountBalancesMock)
  prisonApiClient.getAlerts = jest.fn(async () => pagedActiveAlertsMock)
  prisonApiClient.getAssessments = jest.fn(async () => assessmentsMock)
  prisonApiClient.getEventsScheduledForToday = jest.fn(async () => dummyScheduledEvents)
  prisonApiClient.getInmateDetail = jest.fn(async () => inmateDetailMock)
  prisonApiClient.getOffenderActivitiesHistory = jest.fn(async () => OffenderActivitiesMock)
  prisonApiClient.getOffenderAttendanceHistory = jest.fn(async () => OffenderAttendanceHistoryMock())
  prisonApiClient.getPersonalCareNeeds = jest.fn(async () => personalCareNeedsMock)
  prisonApiClient.getPrisoner = jest.fn(async () => prisonerDetailMock)
  prisonApiClient.getVisitBalances = jest.fn(async () => visitBalancesMock)
  prisonApiClient.getVisitSummary = jest.fn(async () => visitSummaryMock)

  const curiousApiClient = {
    getLearnerEmployabilitySkills: jest.fn(async () => learnerEmployabilitySkills),
    getLearnerProfile: jest.fn(async () => LearnerProfiles),
    getLearnerEducation: jest.fn(async () => learnerEducation),
    getLearnerLatestAssessments: jest.fn(async () => LearnerLatestAssessmentsMock),
    getLearnerGoals: jest.fn(),
    getLearnerNeurodivergence: jest.fn(async () => LearnerNeurodivergenceMock),
  }

  const personalLearningPlanService = {
    getPrisonerActionPlan: jest.fn(),
  }

  const workAndSkillsPageServiceConstruct = jest.fn(() => {
    return new WorkAndSkillsPageService(
      () => curiousApiClient,
      () => prisonApiClient,
      personalLearningPlanService,
    )
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Scenario A', () => {
    beforeEach(() => {
      curiousApiClient.getLearnerGoals.mockReturnValue(aValidLearnerGoals())
    })

    describe('Work and skills', () => {
      it.each(['ABC123', 'DEF321'])('Gets the activities history for the prisoner', async (prisonerNumber: string) => {
        const workAndSkillsPageService = workAndSkillsPageServiceConstruct()
        await workAndSkillsPageService.get('token', { prisonerNumber } as Prisoner)
      })

      it.each(['ABC123', 'DEF321'])('Gets the attendance history for the prisoner', async (prisonerNumber: string) => {
        const workAndSkillsPageService = workAndSkillsPageServiceConstruct()
        const todaysDate = format(startOfDay(new Date()), 'yyyy-MM-dd')
        const sixMonthsAgo = format(subMonths(startOfDay(new Date()), 6), 'yyyy-MM-dd')
        const res = await workAndSkillsPageService.get('token', { prisonerNumber } as Prisoner)
        expect(prisonApiClient.getOffenderAttendanceHistory).toHaveBeenCalledWith(
          prisonerNumber,
          sixMonthsAgo,
          todaysDate,
        )
        expect(res.learnerEducation).toEqual([
          { key: { text: 'string' }, value: { text: 'Planned end date on 1 March 2023' } },
        ])
      })

      it.each(['ABC123', 'DEF321'])(
        'Gets the courses and qualifications for the prisoner',
        async (prisonerNumber: string) => {
          const workAndSkillsPageService = workAndSkillsPageServiceConstruct()
          const res = await workAndSkillsPageService.get('token', { prisonerNumber } as Prisoner)
          expect(curiousApiClient.getLearnerEducation).toHaveBeenCalledWith(prisonerNumber)
          expect(res.learnerEducation).toEqual([
            { key: { text: 'string' }, value: { text: 'Planned end date on 1 March 2023' } },
          ])
        },
      )

      it.each(['ABC123', 'DEF321'])(
        'Gets the employability skills for the prisoner',
        async (prisonerNumber: string) => {
          const workAndSkillsPageService = workAndSkillsPageServiceConstruct()
          const res = await workAndSkillsPageService.get('token', { prisonerNumber } as Prisoner)
          expect(curiousApiClient.getLearnerEmployabilitySkills).toHaveBeenCalledWith(prisonerNumber)
          expect(res.learnerEmployabilitySkills).toEqual({
            content: [
              {
                activityEndDate: '2023-02-28',
                activityLocation: 'string',
                activityStartDate: '2023-02-28',
                deliveryLocationPostCode: 'string',
                deliveryMethodType: 'string',
                employabilitySkill: 'string',
                establishmentId: 'string',
                establishmentName: 'string',
                prn: 'G6123VU',
                reviews: [{ comment: 'string', currentProgression: 'string', reviewDate: '2023-02-28' }],
              },
            ],
            empty: true,
            first: true,
            last: true,
            number: 0,
            numberOfElements: 0,
            pageable: {
              offset: 0,
              pageNumber: 0,
              pageSize: 0,
              paged: true,
              sort: { empty: true, sorted: true, unsorted: true },
              unpaged: true,
            },
            size: 0,
            sort: { empty: true, sorted: true, unsorted: true },
            totalElements: 0,
            totalPages: 0,
          })
        },
      )

      it.each(['ABC123', 'DEF321'])(
        'Gets the employability skills for the prisoner',
        async (prisonerNumber: string) => {
          const workAndSkillsPageService = workAndSkillsPageServiceConstruct()
          const res = await workAndSkillsPageService.get('token', { prisonerNumber } as Prisoner)
          expect(curiousApiClient.getLearnerProfile).toHaveBeenCalledWith(prisonerNumber)
          expect(res.learnerEmployabilitySkills).toEqual({
            content: [
              {
                activityEndDate: '2023-02-28',
                activityLocation: 'string',
                activityStartDate: '2023-02-28',
                deliveryLocationPostCode: 'string',
                deliveryMethodType: 'string',
                employabilitySkill: 'string',
                establishmentId: 'string',
                establishmentName: 'string',
                prn: 'G6123VU',
                reviews: [{ comment: 'string', currentProgression: 'string', reviewDate: '2023-02-28' }],
              },
            ],
            empty: true,
            first: true,
            last: true,
            number: 0,
            numberOfElements: 0,
            pageable: {
              offset: 0,
              pageNumber: 0,
              pageSize: 0,
              paged: true,
              sort: { empty: true, sorted: true, unsorted: true },
              unpaged: true,
            },
            size: 0,
            sort: { empty: true, sorted: true, unsorted: true },
            totalElements: 0,
            totalPages: 0,
          })
        },
      )
    })
  })

  describe('Curious Goals', () => {
    describe('Work and skills', () => {
      it('should return CuriousGoals for a prisoner with learner goals in Curious', async () => {
        // Given
        const prisonerNumber = '123123'
        const workAndSkillsPageService = workAndSkillsPageServiceConstruct()

        const learnerGoals = aValidLearnerGoals({
          prn: prisonerNumber,
          employmentGoals: ['An employment goal'],
          personalGoals: ['A personal goal'],
          shortTermGoals: ['A short term goal'],
          longTermGoals: ['A long term goal'],
        })
        curiousApiClient.getLearnerGoals.mockReturnValue(learnerGoals)

        const expectedCuriousGoals: CuriousGoals = {
          prisonerNumber,
          employmentGoals: [{ key: { text: 'An employment goal' }, value: { text: '' } }],
          personalGoals: [{ key: { text: 'A personal goal' }, value: { text: '' } }],
          shortTermGoals: [{ key: { text: 'A short term goal' }, value: { text: '' } }],
          longTermGoals: [{ key: { text: 'A long term goal' }, value: { text: '' } }],
          problemRetrievingData: false,
        }
        curiousGoalsMapperMock.mockReturnValue(expectedCuriousGoals)

        // When
        const res = await workAndSkillsPageService.get('token', { prisonerNumber } as Prisoner)

        // Then
        expect(res.curiousGoals).toEqual(expectedCuriousGoals)
        expect(curiousGoalsMapperMock).toHaveBeenCalledWith(learnerGoals)
      })

      describe('should return empty CuriousGoals for a prisoner without learner goals in Curious', () => {
        // The Curious API appears inconsistent in it's handling of prisoners without Goals
        // Some prisoners have a 200 response body returned containing empty arrays
        // Whilst others get a 404 response (which the API client class ignores and returns a null to the service)

        it('should return empty CuriousGoals given Curious returns an object of empty arrays', async () => {
          // Given
          const prisonerNumber = '123123'
          const workAndSkillsPageService = workAndSkillsPageServiceConstruct()

          const learnerGoals = aValidLearnerGoals({
            prn: prisonerNumber,
            employmentGoals: [],
            personalGoals: [],
            shortTermGoals: [],
            longTermGoals: [],
          })
          curiousApiClient.getLearnerGoals.mockReturnValue(learnerGoals)

          const expectedCuriousGoals: CuriousGoals = {
            prisonerNumber,
            employmentGoals: [],
            personalGoals: [],
            shortTermGoals: [],
            longTermGoals: [],
            problemRetrievingData: false,
          }
          curiousGoalsMapperMock.mockReturnValue(expectedCuriousGoals)

          // When
          const res = await workAndSkillsPageService.get('token', { prisonerNumber } as Prisoner)

          // Then
          expect(res.curiousGoals).toEqual(expectedCuriousGoals)
          expect(curiousGoalsMapperMock).toHaveBeenCalledWith(learnerGoals)
        })

        it('should return empty CuriousGoals given Curious returns a 404 which is returned to the service as a null', async () => {
          // Given
          const prisonerNumber = '123123'
          const workAndSkillsPageService = workAndSkillsPageServiceConstruct()

          curiousApiClient.getLearnerGoals.mockReturnValue(null)

          const expectedCuriousGoals: CuriousGoals = {
            prisonerNumber,
            employmentGoals: [],
            personalGoals: [],
            shortTermGoals: [],
            longTermGoals: [],
            problemRetrievingData: false,
          }
          curiousGoalsMapperMock.mockReturnValue(expectedCuriousGoals)

          // When
          const res = await workAndSkillsPageService.get('token', { prisonerNumber } as Prisoner)

          // Then
          expect(res.curiousGoals).toEqual(expectedCuriousGoals)
          expect(curiousGoalsMapperMock).not.toHaveBeenCalled()
        })
      })

      it('should return CuriousGoals Curious API throws an error', async () => {
        // Given
        const prisonerNumber = '123123'
        const workAndSkillsPageService = workAndSkillsPageServiceConstruct()

        const curiousApiError = {
          status: 501,
          data: {
            status: 501,
            userMessage: 'An unexpected error occurred',
            developerMessage: 'An unexpected error occurred',
          },
        }
        curiousApiClient.getLearnerGoals.mockRejectedValue(curiousApiError)

        const expectedCuriousGoals = {
          problemRetrievingData: true,
        } as CuriousGoals

        // When
        const res = await workAndSkillsPageService.get('token', { prisonerNumber } as Prisoner)

        // Then
        expect(res.curiousGoals).toEqual(expectedCuriousGoals)
        expect(curiousGoalsMapperMock).not.toHaveBeenCalled()
      })
    })
  })
})
