import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
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
import { pagedActiveAlertsMock } from '../data/localMockData/pagedAlertsMock'
import OffencesPageService from './offencesPageService'
import CourtCasesMock from '../data/localMockData/courtCaseMock'
import OffenceHistoryMock from '../data/localMockData/offenceHistoryMock'
import SentenceTermsMock from '../data/localMockData/SentenceTermsMock'
import { prisonerSentenceDetailsMock } from '../data/localMockData/prisonerSentenceDetails'
import {
  GetCourtCaseData,
  GetReleaseDates,
  GroupedSentencesMock,
  MergeMostRecentLicenseTermMock,
  OffencesPageMockSentences,
} from '../data/localMockData/offencesPageMock'

describe('OffencesPageService', () => {
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
    getOffenderContacts: jest.fn(),
    getCaseNoteSummaryByTypes: jest.fn(),
    getPrisoner: jest.fn(async () => prisonerDetailMock),
    getInmateDetail: jest.fn(async () => inmateDetailMock),
    getPersonalCareNeeds: jest.fn(async () => personalCareNeedsMock),
    getOffenderActivitiesHistory: jest.fn(),
    getOffenderAttendanceHistory: jest.fn(),
    getSecondaryLanguages: jest.fn(),
    getAlerts: jest.fn(async () => pagedActiveAlertsMock),
    getProperty: jest.fn(),
    getCourtCases: jest.fn(async () => CourtCasesMock),
    getOffenceHistory: jest.fn(async () => OffenceHistoryMock),
    getSentenceTerms: jest.fn(async () => SentenceTermsMock),
    getPrisonerSentenceDetails: jest.fn(async () => prisonerSentenceDetailsMock),
  }

  const offencesPageServiceConstruct = jest.fn(() => {
    return new OffencesPageService(prisonApiClient)
  })

  beforeEach(() => {
    prisonApiClient.getCourtCases = jest.fn(async () => CourtCasesMock)
    prisonApiClient.getOffenceHistory = jest.fn(async () => OffenceHistoryMock)
    prisonApiClient.getSentenceTerms = jest.fn(async () => SentenceTermsMock)
    prisonApiClient.getPrisonerSentenceDetails = jest.fn(async () => prisonerSentenceDetailsMock)
  })

  describe('Offences Page', () => {
    it('Get all data for the offences page for the sentences', async () => {
      const offencesPageService = offencesPageServiceConstruct()
      const res = await offencesPageService.get({ prisonerNumber: 'G6123VU', bookingId: 1102484 } as Prisoner)
      expect(res).toEqual(OffencesPageMockSentences)
    })
    it('Get length text labels', async () => {
      const offencesPageService = offencesPageServiceConstruct()
      const sentence1 = await offencesPageService.getLengthTextLabels(SentenceTermsMock[0])
      const sentence2 = await offencesPageService.getLengthTextLabels(SentenceTermsMock[1])
      expect(sentence1).toEqual('100 years')
      expect(sentence2).toEqual('10 years')
    })
    it('Merge most recent licence term', async () => {
      const offencesPageService = offencesPageServiceConstruct()
      const res = await offencesPageService.mergeMostRecentLicenceTerm(SentenceTermsMock)
      expect(res).toEqual(MergeMostRecentLicenseTermMock)
    })
    it('Group sentences by sequence', async () => {
      const offencesPageService = offencesPageServiceConstruct()
      const res = await offencesPageService.groupSentencesBySequence(SentenceTermsMock)
      expect(res).toEqual(GroupedSentencesMock)
    })
    it('Find consecutive sentences', async () => {
      const offencesPageService = offencesPageServiceConstruct()
      const res = await offencesPageService.findConsecutiveSentence({ sentences: SentenceTermsMock, consecutiveTo: 4 })
      expect(res).toEqual(4)
    })
    it('Apply charge code filter', async () => {
      const offencesPageService = offencesPageServiceConstruct()
      const res = await offencesPageService.chargeCodesFilter(OffenceHistoryMock)
      expect(res).toEqual([
        669502, 462833, 669502, 462833, 666929, 666929, 955236, 955236, 1434365, 1507172, 1563198, 669502, 1563148,
        1563148, 1563148, 1563201,
      ])
    })
    it('Get court case details', async () => {
      const offencesPageService = offencesPageServiceConstruct()
      const res = await offencesPageService.getCourtCasesData(1102484, 'G6123VU')
      expect(res).toEqual(GetCourtCaseData)
    })
    it('Get release dates', async () => {
      const offencesPageService = offencesPageServiceConstruct()
      const res = await offencesPageService.getReleaseDates('G6123VU')
      expect(res).toEqual(GetReleaseDates)
    })
  })
})
