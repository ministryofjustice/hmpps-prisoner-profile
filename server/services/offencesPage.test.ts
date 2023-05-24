import { format, startOfToday } from 'date-fns'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { Prisoner } from '../interfaces/prisoner'
import OffencesPageService from './offencesPageService'
import {
  CourtCasesMock,
  CourtCasesSentencedMockA,
  CourtCasesUnsentencedMockA,
  CourtCaseWithNextCourtAppearance,
  SentenceTermsWithOffences,
  SentenceTermsWithoutOffences,
} from '../data/localMockData/courtCaseMock'
import { OffenceHistoryMock, OffenceHistoryMockA } from '../data/localMockData/offenceHistoryMock'
import {
  GenericMapMock,
  MappedSentencedCourtCasesMock,
  MappedUnsentencedCourtCasesMock,
  SentencedTermsMockA,
  sentenceTermsMock,
  SummaryDetailRowsMock,
} from '../data/localMockData/sentenceTermsMock'
import { prisonerSentenceDetailsMock } from '../data/localMockData/prisonerSentenceDetails'
import {
  GetCourtCaseData,
  GetReleaseDates,
  GroupedSentencesMock,
  MergeMostRecentLicenseTermMock,
  OffencesPageMockSentences,
} from '../data/localMockData/offencesPageMock'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import { CourtDateResultsMockA, CourtDateResultsUnsentencedMockA } from '../data/localMockData/courtDateResultsMock'

describe('OffencesPageService', () => {
  let prisonApiClient: PrisonApiClient
  const todaysDate = format(startOfToday(), 'yyyy-MM-dd')

  const offencesPageServiceConstruct = jest.fn(() => {
    return new OffencesPageService(prisonApiClient)
  })

  beforeEach(() => {
    prisonApiClient = prisonApiClientMock()
    prisonApiClient.getCourtCases = jest.fn(async () => CourtCasesMock)
    prisonApiClient.getOffenceHistory = jest.fn(async () => OffenceHistoryMock)
    prisonApiClient.getSentenceTerms = jest.fn(async () => sentenceTermsMock)
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
      const sentence1 = await offencesPageService.getLengthTextLabels(sentenceTermsMock[0])
      const sentence2 = await offencesPageService.getLengthTextLabels(sentenceTermsMock[1])
      expect(sentence1).toEqual('100 years')
      expect(sentence2).toEqual('10 years')
    })
    it('Merge most recent licence term', async () => {
      const offencesPageService = offencesPageServiceConstruct()
      const res = await offencesPageService.mergeMostRecentLicenceTerm(sentenceTermsMock)
      expect(res).toEqual(MergeMostRecentLicenseTermMock)
    })
    it('Group sentences by sequence', async () => {
      const offencesPageService = offencesPageServiceConstruct()
      const res = await offencesPageService.groupSentencesBySequence(sentenceTermsMock)
      expect(res).toEqual(GroupedSentencesMock)
    })
    it('Find consecutive sentences', async () => {
      const offencesPageService = offencesPageServiceConstruct()
      const res = await offencesPageService.findConsecutiveSentence({ sentences: sentenceTermsMock, consecutiveTo: 4 })
      expect(res).toEqual('Consecutive')
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
    it('Get map for sentenced court cases', async () => {
      const offencesPageService = offencesPageServiceConstruct()
      const res = await offencesPageService.getMapForSentencedCourtCases(
        CourtCasesSentencedMockA,
        [1520515],
        todaysDate,
        SentencedTermsMockA,
        OffenceHistoryMockA,
        CourtDateResultsMockA,
      )
      expect(res).toEqual(MappedSentencedCourtCasesMock)
    })

    it('Get map for unsentenced court cases', async () => {
      const offencesPageService = offencesPageServiceConstruct()
      const res = await offencesPageService.getMapForUnsentencedCourtCases(
        CourtCasesUnsentencedMockA,
        todaysDate,
        CourtDateResultsUnsentencedMockA,
        [],
      )
      expect(res).toEqual(MappedUnsentencedCourtCasesMock)
    })

    describe('Next court appearance', () => {
      it('Should not contain a next court appearance', async () => {
        const offencesPageService = offencesPageServiceConstruct()
        const res = await offencesPageService.getNextCourtAppearance(CourtCasesUnsentencedMockA[0], todaysDate)
        expect(res).toEqual({})
      })
      it('Should contain a next court appearance', async () => {
        const offencesPageService = offencesPageServiceConstruct()
        const res = await offencesPageService.getNextCourtAppearance(CourtCaseWithNextCourtAppearance[0], todaysDate)
        expect(res).toEqual(CourtCaseWithNextCourtAppearance[0].courtHearings[0])
      })
      it('Should contain a next court appearance', async () => {
        const offencesPageService = offencesPageServiceConstruct()
        const res = await offencesPageService.getNextCourtAppearance(CourtCaseWithNextCourtAppearance[1], todaysDate)
        expect(res).toEqual(CourtCaseWithNextCourtAppearance[1].courtHearings[2])
      })
    })

    it('Get court hearings', async () => {
      const offencesPageService = offencesPageServiceConstruct()
      const res = await offencesPageService.getCourtHearings(CourtCasesUnsentencedMockA[0])
      expect(res).toEqual(CourtCasesUnsentencedMockA[0].courtHearings)
    })

    it('Get court info number', async () => {
      const offencesPageService = offencesPageServiceConstruct()
      const res = await offencesPageService.getCourtInfoNumber(CourtCasesUnsentencedMockA[0])
      expect(res).toEqual(CourtCasesUnsentencedMockA[0].caseInfoNumber)
    })

    it('Get court name', async () => {
      const offencesPageService = offencesPageServiceConstruct()
      const res = await offencesPageService.getCourtName(CourtCasesUnsentencedMockA[0])
      expect(res).toEqual(CourtCasesUnsentencedMockA[0].agency.description)
    })

    it('Get count text for any court case', async () => {
      const offencesPageService = offencesPageServiceConstruct()
      expect(offencesPageService.getCountDisplayText(4)).toEqual('Count 4')
      expect(offencesPageService.getCountDisplayText(1)).toEqual('Count 1')
    })

    it('Get count for unsentenced court cases', async () => {
      const offencesPageService = offencesPageServiceConstruct()
      const res = await offencesPageService.getCountForUnsentencedCourtCase(CourtCasesUnsentencedMockA[0])
      expect(res).toEqual(offencesPageService.getCountDisplayText(CourtCasesUnsentencedMockA[0].caseSeq))
    })

    it('Get count for sentenced court cases', async () => {
      const offencesPageService = offencesPageServiceConstruct()
      const res = await offencesPageService.getCountForSentencedCourtCase(SentencedTermsMockA[0])
      expect(res).toEqual(offencesPageService.getCountDisplayText(SentencedTermsMockA[0].lineSeq))
    })

    it('Get offences', async () => {
      const offencesPageService = offencesPageServiceConstruct()
      const res = await offencesPageService.getOffences(
        CourtCasesSentencedMockA[0],
        OffenceHistoryMockA,
        CourtDateResultsMockA,
      )
      expect(res).toEqual(OffenceHistoryMockA)
    })

    it('Get summary detail rows', async () => {
      const offencesPageService = offencesPageServiceConstruct()
      const res = await offencesPageService.getSummaryDetailRow(SentencedTermsMockA[0], SentencedTermsMockA)
      expect(res).toEqual(SummaryDetailRowsMock)
    })

    it('Get sentence terms - data with offences', async () => {
      const offencesPageService = offencesPageServiceConstruct()
      const res = await offencesPageService.getSentenceTerms(
        CourtCasesSentencedMockA[0],
        SentencedTermsMockA,
        OffenceHistoryMockA,
        CourtDateResultsMockA,
      )
      expect(res).toEqual(SentenceTermsWithOffences)
    })

    it('Get sentence terms - data without offences', async () => {
      const offencesPageService = offencesPageServiceConstruct()
      const res = await offencesPageService.getSentenceTerms(
        CourtCasesSentencedMockA[0],
        SentencedTermsMockA,
        OffenceHistoryMock,
        CourtDateResultsMockA,
      )
      expect(res).toEqual(SentenceTermsWithoutOffences)
    })

    it('Get generic maps', async () => {
      const offencesPageService = offencesPageServiceConstruct()
      const res = await offencesPageService.getGenericMaps(CourtCasesSentencedMockA[0], todaysDate)
      expect(res).toEqual(GenericMapMock)
    })
  })
})
