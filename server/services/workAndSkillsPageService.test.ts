// eslint-disable-next-line import/no-extraneous-dependencies
import moment from 'moment'

import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import dummyScheduledEvents from '../data/localMockData/eventsForToday'
import nonAssociationDetailsDummyData from '../data/localMockData/nonAssociations'
import { Prisoner } from '../interfaces/prisoner'
import {
  accountBalancesMock,
  adjudicationSummaryMock,
  assessmentsMock,
  visitBalancesMock,
  visitSummaryMock,
} from '../data/localMockData/miniSummaryMock'

import { prisonerDetailMock } from '../data/localMockData/prisonerDetailMock'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import { personalCareNeedsMock } from '../data/localMockData/personalCareNeedsMock'
import CuriousApiClient from '../data/interfaces/curiousApiClient'
import WorkAndSkillsPageService from './workAndSkillsPageService'
import { OffenderActivitiesMock } from '../data/localMockData/offenderActivitiesMock'
import { OffenderAttendanceHistoryMock } from '../data/localMockData/offenderAttendanceHistoryMock'
import { learnerEmployabilitySkills } from '../data/localMockData/learnerEmployabilitySkills'
import { LearnerProfiles } from '../data/localMockData/learnerProfiles'
import { learnerEducation } from '../data/localMockData/learnerEducation'
import { LearnerLatestAssessmentsMock } from '../data/localMockData/learnerLatestAssessmentsMock'
import { LearnerGoalsMock } from '../data/localMockData/learnerGoalsMock'
import { LearnerNeurodivergenceMock } from '../data/localMockData/learnerNeurodivergenceMock'
import { pagedActiveAlertsMock } from '../data/localMockData/pagedAlertsMock'

describe('WorkAndSkillsService', () => {
  const prisonApiClient: PrisonApiClient = {
    getNonAssociationDetails: jest.fn(),
    getEventsScheduledForToday: jest.fn(),
    getUserCaseLoads: jest.fn(),
    getUserLocations: jest.fn(),
    getVisitBalances: jest.fn(async () => visitBalancesMock),
    getVisitSummary: jest.fn(async () => visitSummaryMock),
    getAdjudications: jest.fn(async () => adjudicationSummaryMock),
    getAccountBalances: jest.fn(async () => accountBalancesMock),
    getAssessments: jest.fn(async () => assessmentsMock),
    getBookingContacts: jest.fn(),
    getCaseNoteSummaryByTypes: jest.fn(),
    getPrisoner: jest.fn(async () => prisonerDetailMock),
    getInmateDetail: jest.fn(async () => inmateDetailMock),
    getPersonalCareNeeds: jest.fn(async () => personalCareNeedsMock),
    getOffenderActivitiesHistory: jest.fn(async () => OffenderActivitiesMock),
    getOffenderAttendanceHistory: jest.fn(async () => OffenderAttendanceHistoryMock),
    getSecondaryLanguages: jest.fn(),
    getAlerts: jest.fn(async () => pagedActiveAlertsMock),
    getProperty: jest.fn(),
    getAddresses: jest.fn(),
    getAddressesForPerson: jest.fn(),
    getOffenderContacts: jest.fn(),
  }

  const curiousApiClient: CuriousApiClient = {
    getLearnerEmployabilitySkills: jest.fn(async () => learnerEmployabilitySkills),
    getLearnerProfile: jest.fn(async () => LearnerProfiles),
    getLearnerEducation: jest.fn(async () => learnerEducation),
    getLearnerLatestAssessments: jest.fn(async () => LearnerLatestAssessmentsMock),
    getLearnerGoals: jest.fn(async () => LearnerGoalsMock),
    getLearnerNeurodivergence: jest.fn(async () => LearnerNeurodivergenceMock),
  }

  const workAndSkillsPageServiceConstruct = jest.fn(() => {
    return new WorkAndSkillsPageService(curiousApiClient, prisonApiClient)
  })

  beforeEach(() => {
    prisonApiClient.getNonAssociationDetails = jest.fn(async () => nonAssociationDetailsDummyData)
    prisonApiClient.getEventsScheduledForToday = jest.fn(async () => dummyScheduledEvents)
  })

  describe('Work and Skills', () => {
    it.each(['ABC123', 'DEF321'])('Gets the activities history for the prisoner', async (prisonerNumber: string) => {
      const workAndSkillsPageService = workAndSkillsPageServiceConstruct()
      await workAndSkillsPageService.get({ prisonerNumber } as Prisoner)
    })

    it.each(['ABC123', 'DEF321'])('Gets the attendance history for the prisoner', async (prisonerNumber: string) => {
      const workAndSkillsPageService = workAndSkillsPageServiceConstruct()
      const todaysDate = moment().startOf('day').format('YYYY-MM-DD')
      const sixMonthsAgo = moment().startOf('day').subtract(6, 'month').format('YYYY-MM-DD')
      const res = await workAndSkillsPageService.get({ prisonerNumber } as Prisoner)
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
        const res = await workAndSkillsPageService.get({ prisonerNumber } as Prisoner)
        expect(curiousApiClient.getLearnerEducation).toHaveBeenCalledWith(prisonerNumber)
        expect(res.learnerEducation).toEqual([
          { key: { text: 'string' }, value: { text: 'Planned end date on 1 March 2023' } },
        ])
      },
    )

    it.each(['ABC123', 'DEF321'])('Gets the employability skills for the prisoner', async (prisonerNumber: string) => {
      const workAndSkillsPageService = workAndSkillsPageServiceConstruct()
      const res = await workAndSkillsPageService.get({ prisonerNumber } as Prisoner)
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
    })

    it.each(['ABC123', 'DEF321'])('Gets the employability skills for the prisoner', async (prisonerNumber: string) => {
      const workAndSkillsPageService = workAndSkillsPageServiceConstruct()
      const res = await workAndSkillsPageService.get({ prisonerNumber } as Prisoner)
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
    })
  })
})
