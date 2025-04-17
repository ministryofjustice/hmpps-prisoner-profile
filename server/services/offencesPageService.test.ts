import { startOfToday } from 'date-fns'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import OffencesPageService from './offencesPageService'
import {
  CourtCasesMock,
  CourtCasesUnsentencedMockA,
  CourtCasesUnsentencedMockB,
  CourtCaseWithNextCourtAppearance,
} from '../data/localMockData/courtCaseMock'
import { OffenceHistoryMock } from '../data/localMockData/offenceHistoryMock'
import { MappedUnsentencedCourtCasesMock, sentenceTermsMock } from '../data/localMockData/sentenceTermsMock'
import { prisonerSentenceDetailsMock } from '../data/localMockData/prisonerSentenceDetails'
import {
  GetCourtCaseData,
  GetReleaseDates,
  GroupedSentencesMock,
  MergeMostRecentLicenseTermMock,
  OffencesPageMockSentences,
} from '../data/localMockData/offencesPageMock'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import {
  CourtDateResultsUnsentencedMockB,
  UniqueCourtDateResultsUnsentencedMockA,
} from '../data/localMockData/courtDateResultsMock'
import { SentenceSummaryWithSentenceMock } from '../data/localMockData/sentenceSummaryMock'
import SentenceSummary from '../data/interfaces/prisonApi/SentenceSummary'
import OffenceHistoryDetail from '../data/interfaces/prisonApi/OffenceHistoryDetail'
import { ChargeResultCode } from '../data/enums/chargeCodes'
import OffenderSentenceTerms from '../data/interfaces/prisonApi/OffenderSentenceTerms'
import SentencedCourtCase from './interfaces/offencesPageService/SentencedCourtCase'
import DeepPartial from '../interfaces/DeepPartial'
import CourtCase from '../data/interfaces/prisonApi/CourtCase'
import PrisonerSentenceDetails from '../data/interfaces/prisonApi/PrisonerSentenceDetails'

const simpleSentenceSummary: DeepPartial<SentenceSummary> = {
  prisonerNumber: 'G6123VU',
  latestPrisonTerm: {
    courtSentences: [
      {
        id: 111111,
        sentences: [
          {
            lineSeq: 3,
            sentenceTypeDescription: 'Sentence type description',
            sentenceStartDate: '2016-10-14',
            terms: [
              {
                years: 5,
                months: 2,
                weeks: 3,
                days: 6,
              },
            ],
            fineAmount: 5,
            offences: [
              {
                offenceStartDate: '2016-07-14',
                offenceCode: 'OFFCODE1',
                statuteCode: 'STATUTE',
              },
              {
                offenceStartDate: '2016-07-14',
                offenceCode: 'OFFCODE3',
                statuteCode: 'STATUTE',
              },
            ],
          },
        ],
      },
      {
        id: 222222,
        sentences: [
          {
            lineSeq: 3,
            sentenceTypeDescription: 'Sentence type description',
            sentenceStartDate: '2016-10-15',
            consecutiveToSequence: 1,
            terms: [
              {
                years: 5,
                months: 2,
                weeks: 3,
                days: 6,
              },
            ],
            fineAmount: 5,
            offences: [
              {
                offenceStartDate: '2016-07-15',
                offenceCode: 'OFFCODE2',
                statuteCode: 'STATUTE',
              },
            ],
          },
        ],
      },
    ],
  },
}

describe('OffencesPageService', () => {
  let prisonApiClient: PrisonApiClient

  const offencesPageServiceConstruct = jest.fn(() => {
    return new OffencesPageService(() => prisonApiClient)
  })

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(startOfToday())
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  describe('getCourtCaseData', () => {
    beforeEach(() => {
      const offenceHistory: DeepPartial<OffenceHistoryDetail>[] = [
        {
          offenceDate: '2016-07-14',
          offenceCode: 'OFFCODE1',
          offenceRangeDate: 'OFFENCE RANGE DATE',
          statuteCode: 'STATUTE CODE',
          primaryResultCode: ChargeResultCode.imprisonment,
          caseId: 222222,
        },
        {
          offenceDate: '2016-07-15',
          offenceCode: 'OFFCODE2',
          offenceRangeDate: 'OFFENCE RANGE DATE',
          statuteCode: 'STATUTE CODE2',
          primaryResultCode: ChargeResultCode.imprisonment,
          caseId: 222222,
        },
      ]

      prisonApiClient = prisonApiClientMock()
      prisonApiClient.getCourtCases = jest.fn(async (): Promise<CourtCase[]> => [])
      // @ts-expect-error - returning partial data for test clarity
      prisonApiClient.getOffenceHistory = jest.fn(async () => offenceHistory)
      // @ts-expect-error - returning partial data for test clarity
      prisonApiClient.getSentenceSummary = jest.fn(async () => simpleSentenceSummary)
      prisonApiClient.getSentenceTerms = jest.fn(async () => sentenceTermsMock)
      prisonApiClient.getPrisonerSentenceDetails = jest.fn(async () => prisonerSentenceDetailsMock)
    })

    describe('Offences list', () => {
      it('should take data from any matching offences in offence history', async () => {
        const offencesPageService = offencesPageServiceConstruct()
        const result = (await offencesPageService.getCourtCasesData(
          'token',
          1102484,
          'G6123VU',
        )) as SentencedCourtCase[]

        expect(result[0].sentences[0].offences).toEqual([
          {
            offenceRangeDate: 'OFFENCE RANGE DATE',
            offenceDate: '2016-07-14',
            offenceCode: 'OFFCODE1',
            statuteCode: 'STATUTE CODE',
            offenceStartDate: '2016-07-14',
          },
          {
            offenceCode: 'OFFCODE3',
            offenceStartDate: '2016-07-14',
          },
        ])

        expect(result[1].sentences[0].offences).toEqual([
          {
            offenceRangeDate: 'OFFENCE RANGE DATE',
            offenceDate: '2016-07-15',
            offenceCode: 'OFFCODE2',
            statuteCode: 'STATUTE CODE2',
            offenceStartDate: '2016-07-15',
          },
        ])
      })
    })

    describe('sentence details', () => {
      it('should decorate the sentences with data ', async () => {
        const offencesPageService = offencesPageServiceConstruct()
        const result = (await offencesPageService.getCourtCasesData(
          'token',
          1102484,
          'G6123VU',
        )) as SentencedCourtCase[]

        expect(result[0].sentences[0]).toMatchObject({
          sentenceHeader: 'Count 3',
          sentenceTypeDescription: 'Sentence type description',
          sentenced: true,
          sentenceStartDate: '14 October 2016',
          sentenceLength: '5 years, 2 months, 3 weeks, 6 days',
          fineAmountFormat: '£5.00',
        })
        expect(result[1].sentences[0]).toMatchObject({
          sentenceHeader: 'Count 3',
          sentenceTypeDescription: 'Sentence type description',
          sentenced: true,
          sentenceStartDate: '15 October 2016',
          sentenceLength: '5 years, 2 months, 3 weeks, 6 days',
          fineAmountFormat: '£5.00',
        })
      })

      it('should add sentence licence terms taken from offender sentence terms ', async () => {
        const sentenceTerms: DeepPartial<OffenderSentenceTerms>[] = [
          {
            lineSeq: 1,
            caseId: '111111',
            sentenceTermCode: 'IMP',
            sentenceTypeDescription: 'Sentence type description',
          },
          {
            lineSeq: 2,
            caseId: '222222',
            sentenceTermCode: 'IMP',
            sentenceTypeDescription: 'Sentence type description',
          },
          {
            lineSeq: 1,
            caseId: '111111',
            sentenceTermCode: 'IMP',
            sentenceTypeDescription: 'Sentence type description',
          },
          {
            sentenceTypeDescription: 'Sentence type description',
            lineSeq: 1,
            caseId: '111111',
            sentenceTermCode: 'LIC',
            years: 20,
            months: 0,
            weeks: 0,
            days: 0,
          },
        ]

        // @ts-expect-error - returning partial data for test clarity
        prisonApiClient.getSentenceTerms = jest.fn(async () => sentenceTerms)

        const offencesPageService = offencesPageServiceConstruct()
        const result = (await offencesPageService.getCourtCasesData(
          'token',
          1102484,
          'G6123VU',
        )) as SentencedCourtCase[]
        expect(result[0].sentences[0].sentenceLicence).toEqual('20 years')
      })

      it('should use the fist licence term in the list', async () => {
        const sentenceSummary: DeepPartial<OffenderSentenceTerms>[] = [
          {
            lineSeq: 1,
            caseId: '111111',
            sentenceTermCode: 'IMP',
            sentenceTypeDescription: 'Sentence type description',
          },
          {
            sentenceTypeDescription: 'Sentence type description',
            lineSeq: 1,
            caseId: '111111',
            sentenceTermCode: 'LIC',
            years: 5,
            months: 0,
            weeks: 0,
            days: 0,
          },
          {
            lineSeq: 2,
            caseId: '222222',
            sentenceTermCode: 'IMP',
            sentenceTypeDescription: 'Sentence type description',
          },
          {
            lineSeq: 1,
            caseId: '111111',
            sentenceTermCode: 'LIC',
            years: 20,
            months: 0,
            weeks: 0,
            days: 0,
          },
        ]

        // @ts-expect-error - returning partial data for test clarity
        prisonApiClient.getSentenceTerms = jest.fn(async () => sentenceSummary)

        const offencesPageService = offencesPageServiceConstruct()
        const result = (await offencesPageService.getCourtCasesData(
          'token',
          1102484,
          'G6123VU',
        )) as SentencedCourtCase[]

        expect(result[0].sentences[0].sentenceLicence).toEqual('5 years')
      })

      it('should label as concurrent if term with sentenceSequence matches a sentence consecutiveToSequence and term includes lineSeq', async () => {
        const sentenceTerms: DeepPartial<OffenderSentenceTerms>[] = [
          {
            sentenceSequence: 1,
            lineSeq: 1,
            caseId: '111111',
            sentenceTermCode: 'IMP',
            sentenceTypeDescription: 'Sentence type description',
          },
          {
            sentenceSequence: 1,
            lineSeq: 2,
            caseId: '111111',
            sentenceTermCode: 'IMP',
            sentenceTypeDescription: 'Sentence type description',
          },
        ]

        // @ts-expect-error - returning partial data for test clarity
        prisonApiClient.getSentenceTerms = jest.fn(async () => sentenceTerms)

        const offencesPageService = offencesPageServiceConstruct()
        const result = (await offencesPageService.getCourtCasesData(
          'token',
          1102484,
          'G6123VU',
        )) as SentencedCourtCase[]
        expect(result[1].sentences[0].concurrentConsecutive).toEqual('Consecutive')
      })

      it('should label as concurrent if not multiple terms from same sequence with', async () => {
        const sentenceTerms: DeepPartial<OffenderSentenceTerms>[] = [
          {
            sentenceSequence: 1,
            lineSeq: 1,
            caseId: '111111',
            sentenceTermCode: 'IMP',
            sentenceTypeDescription: 'Sentence type description',
          },
          {
            sentenceSequence: 2,
            lineSeq: 1,
            caseId: '111111',
            sentenceTermCode: 'IMP',
            sentenceTypeDescription: 'Sentence type description',
          },
        ]

        // @ts-expect-error - returning partial data for test clarity
        prisonApiClient.getSentenceTerms = jest.fn(async () => sentenceTerms)

        const offencesPageService = offencesPageServiceConstruct()
        const result = (await offencesPageService.getCourtCasesData(
          'token',
          1102484,
          'G6123VU',
        )) as SentencedCourtCase[]
        expect(result[0].sentences[0].concurrentConsecutive).toEqual('Concurrent')
      })

      it('should use the fist licence term in the list', async () => {
        const sentenceSummary: DeepPartial<OffenderSentenceTerms>[] = [
          {
            sentenceSequence: 1,
            lineSeq: 1,
            caseId: '111111',
            sentenceTermCode: 'IMP',
            sentenceTypeDescription: 'Sentence type description',
          },
          {
            sentenceSequence: 1,
            lineSeq: 2,
            caseId: '222222',
            sentenceTermCode: 'IMP',
            sentenceTypeDescription: 'Sentence type description',
          },
        ]

        // @ts-expect-error - returning partial data for test clarity
        prisonApiClient.getSentenceTerms = jest.fn(async () => sentenceSummary)

        const offencesPageService = offencesPageServiceConstruct()
        const result = (await offencesPageService.getCourtCasesData(
          'token',
          1102484,
          'G6123VU',
        )) as SentencedCourtCase[]

        expect(result[0].sentences[0].concurrentConsecutive).toEqual('Concurrent')
      })
    })
  })

  describe('Offences Page', () => {
    beforeEach(() => {
      prisonApiClient = prisonApiClientMock()
      prisonApiClient.getCourtCases = jest.fn(async () => CourtCasesMock)
      prisonApiClient.getOffenceHistory = jest.fn(async () => OffenceHistoryMock)
      prisonApiClient.getSentenceTerms = jest.fn(async () => sentenceTermsMock)
      prisonApiClient.getPrisonerSentenceDetails = jest.fn(async () => prisonerSentenceDetailsMock)
      prisonApiClient.getSentenceSummary = jest.fn(async () => SentenceSummaryWithSentenceMock)
    })

    it('Get all data for the offences page for the sentences', async () => {
      const offencesPageService = offencesPageServiceConstruct()
      const res = await offencesPageService.get('token', { prisonerNumber: 'G6123VU', bookingId: 1102484 } as Prisoner)

      expect(res).toEqual(OffencesPageMockSentences)
    })

    it('Get length text labels', () => {
      const offencesPageService = offencesPageServiceConstruct()
      const sentence1 = offencesPageService.getLengthTextLabels(sentenceTermsMock[0])
      const sentence2 = offencesPageService.getLengthTextLabels(sentenceTermsMock[1])
      const lifeSentence = offencesPageService.getLengthTextLabels(sentenceTermsMock[4])
      const undefinedSentenceData = offencesPageService.getLengthTextLabels(undefined)
      expect(sentence1).toEqual('100 years')
      expect(sentence2).toEqual('10 years')
      expect(lifeSentence).toEqual('Not entered')
      expect(undefinedSentenceData).toEqual(null)
    })

    it('Merge most recent licence term', () => {
      const offencesPageService = offencesPageServiceConstruct()
      const res = offencesPageService.mergeMostRecentLicenceTerm(sentenceTermsMock)
      expect(res).toEqual(MergeMostRecentLicenseTermMock)
    })

    it('Group sentences by sequence', () => {
      const offencesPageService = offencesPageServiceConstruct()
      const res = offencesPageService.groupSentencesBySequence(sentenceTermsMock)
      expect(res).toEqual(GroupedSentencesMock)
    })

    it('Apply charge code filter', () => {
      const offencesPageService = offencesPageServiceConstruct()
      const res = offencesPageService.getCaseIdsFilteredByResultCode(OffenceHistoryMock)
      expect(res).toEqual([
        669502, 462833, 669502, 462833, 666929, 666929, 955236, 955236, 1434365, 1507172, 1563198, 669502, 1563148,
        1563148, 1563148, 1563201,
      ])
    })

    it('Get court case details', async () => {
      const offencesPageService = offencesPageServiceConstruct()
      const res = await offencesPageService.getCourtCasesData('token', 1102484, 'G6123VU')
      expect(res).toEqual(GetCourtCaseData)
    })
    it('Get release dates', async () => {
      const offencesPageService = offencesPageServiceConstruct()
      const res = await offencesPageService.getReleaseDates('token', 'G6123VU')
      expect(res).toEqual(GetReleaseDates)
    })

    it('Get map for unsentenced court cases', () => {
      const offencesPageService = offencesPageServiceConstruct()
      const res = offencesPageService.mapUnsentencedCourtCases(
        CourtCasesUnsentencedMockB,
        CourtDateResultsUnsentencedMockB,
      )
      expect(res).toEqual(MappedUnsentencedCourtCasesMock)
    })

    describe('Next court appearance', () => {
      it('Should not contain a next court appearance', () => {
        const offencesPageService = offencesPageServiceConstruct()
        const res = offencesPageService.getNextCourtAppearance(CourtCasesUnsentencedMockA[0])
        expect(res).toEqual(undefined)
      })
      it('Should contain a next court appearance', () => {
        const offencesPageService = offencesPageServiceConstruct()
        const res = offencesPageService.getNextCourtAppearance(CourtCaseWithNextCourtAppearance[0])
        expect(res).toEqual(CourtCaseWithNextCourtAppearance[0].courtHearings[0])
      })
      it('Should contain a next court appearance', () => {
        const offencesPageService = offencesPageServiceConstruct()
        const res = offencesPageService.getNextCourtAppearance(CourtCaseWithNextCourtAppearance[1])
        expect(res).toEqual(CourtCaseWithNextCourtAppearance[1].courtHearings[2])
      })
    })

    it('Get court name', () => {
      const offencesPageService = offencesPageServiceConstruct()
      const res = offencesPageService.getCourtName(CourtCasesUnsentencedMockA[0])
      expect(res).toEqual(CourtCasesUnsentencedMockA[0].agency.description)
    })

    it('Get unique charges from court date results', async () => {
      const offencesPageService = offencesPageServiceConstruct()
      const res = await offencesPageService.getUniqueChargesFromCourtDateResults(CourtDateResultsUnsentencedMockB)
      expect(res).toEqual(UniqueCourtDateResultsUnsentencedMockA)
    })
  })

  describe('Release dates', () => {
    const sentenceDetail = {
      actualParoleDate: '2016-01-01',
      automaticReleaseOverrideDate: '2016-01-02',
      automaticReleaseDate: '2016-01-03',
      conditionalReleaseOverrideDate: '2016-01-04',
      conditionalReleaseDate: '2016-01-05',
      confirmedReleaseDate: '2016-01-06',
      dtoPostRecallReleaseDateOverride: '2016-01-07',
      dtoPostRecallReleaseDate: '2016-01-08',
      detentionPostRecallReleaseDate: 'unused',
      earlyTermDate: '2016-01-09',
      earlyRemovalSchemeEligibilityDate: '2016-01-10',
      etdCalculatedDate: '2016-01-11',
      etdOverrideDate: '2016-01-12',
      effectiveSentenceEndDate: 'unused',
      homeDetentionCurfewActualDate: '2016-01-13',
      homeDetentionCurfewEligibilityDate: '2016-01-14',
      licenceExpiryCalculatedDate: 'unused',
      licenceExpiryDate: '2016-02-02',
      lateTermDate: '2016-01-15',
      ltdOverrideDate: '2016-01-16',
      ltdCalculatedDate: '2016-01-17',
      mtdCalculatedDate: '2016-01-18',
      mtdOverrideDate: '2016-01-19',
      midTermDate: '2016-01-20',
      nonDtoReleaseDateType: 'ARD' as 'ARD' | 'CRD' | 'NPD' | 'PRRD',
      nonDtoReleaseDate: '2016-01-21',
      nonParoleOverrideDate: '2016-01-22',
      nonParoleDate: '2016-01-23',
      paroleEligibilityCalculatedDate: '2016-01-24',
      paroleEligibilityDate: 'unused',
      paroleEligibilityOverrideDate: '2016-01-24',
      postRecallReleaseDate: '2016-01-25',
      postRecallReleaseOverrideDate: '2016-01-26',
      releaseDate: 'unused',
      releaseOnTemporaryLicenceDate: '2016-01-27',
      sentenceExpiryCalculatedDate: 'unused',
      sentenceExpiryDate: '2016-02-01',
      sentenceStartDate: 'unused',
      tariffEarlyRemovalSchemeEligibilityDate: '2016-01-28',
      tariffDate: '2016-01-29',
      topupSupervisionExpiryDate: '2016-01-30',
      topupSupervisionExpiryOverrideDate: '2016-01-31',
    }

    beforeEach(() => {
      prisonApiClient = prisonApiClientMock()
      prisonApiClient.getCourtCases = jest.fn(async () => CourtCasesMock)
      prisonApiClient.getOffenceHistory = jest.fn(async () => OffenceHistoryMock)
      prisonApiClient.getSentenceTerms = jest.fn(async () => sentenceTermsMock)
      prisonApiClient.getSentenceSummary = jest.fn(async () => SentenceSummaryWithSentenceMock)
    })

    it('should return all dates if returned', async () => {
      prisonApiClient.getPrisonerSentenceDetails = jest.fn(async () => ({
        ...prisonerSentenceDetailsMock,
        sentenceDetail,
      }))
      const offencesPageService = offencesPageServiceConstruct()
      const res = await offencesPageService.getReleaseDates('token', '12345')
      expect(res).toEqual({
        actualParoleDate: '2016-01-01',
        automaticReleaseDate: '2016-01-02',
        confirmedReleaseDate: '2016-01-06',
        conditionalRelease: '2016-01-04',
        detentionTrainingOrderPostRecallDate: '2016-01-07',
        earlyRemovalSchemeEligibilityDate: '2016-01-10',
        earlyTermDate: '2016-01-09',
        earlyTransferDate: '2016-01-12',
        homeDetentionCurfewActualDate: '2016-01-13',
        homeDetentionCurfewEligibilityDate: '2016-01-14',
        lateTermDate: '2016-01-15',
        lateTransferDate: '2016-01-16',
        midTermDate: '2016-01-20',
        midTransferDate: '2016-01-19',
        nonParoleDate: '2016-01-22',
        paroleEligibilityCalculatedDate: '2016-01-24',
        postRecallDate: '2016-01-26',
        releaseOnTemporaryLicenceDate: '2016-01-27',
        sentenceExpiryDate: '2016-02-01',
        tariffDate: '2016-01-29',
        tariffEarlyRemovalSchemeEligibilityDate: '2016-01-28',
        topupSupervisionExpiryDate: '2016-01-31',
        automaticReleaseDateNonDto: '2016-01-21',
      })
    })

    it('should use override dates where available', async () => {
      prisonApiClient.getPrisonerSentenceDetails = jest.fn(async () => ({
        ...prisonerSentenceDetailsMock,
        sentenceDetail,
      }))
      const offencesPageService = offencesPageServiceConstruct()
      const res = await offencesPageService.getReleaseDates('token', '12345')
      expect(res).toMatchObject({
        automaticReleaseDate: sentenceDetail.automaticReleaseOverrideDate,
        conditionalRelease: sentenceDetail.conditionalReleaseOverrideDate,
        detentionTrainingOrderPostRecallDate: sentenceDetail.dtoPostRecallReleaseDateOverride,
        earlyTransferDate: sentenceDetail.etdOverrideDate,
        lateTransferDate: sentenceDetail.ltdOverrideDate,
        midTransferDate: sentenceDetail.mtdOverrideDate,
        nonParoleDate: sentenceDetail.nonParoleOverrideDate,
        paroleEligibilityCalculatedDate: sentenceDetail.paroleEligibilityOverrideDate,
        postRecallDate: sentenceDetail.postRecallReleaseOverrideDate,
        topupSupervisionExpiryDate: sentenceDetail.topupSupervisionExpiryOverrideDate,
      })
    })

    it('should return calculated dates where overrides dont exist', async () => {
      prisonApiClient.getPrisonerSentenceDetails = jest.fn(
        async (): Promise<PrisonerSentenceDetails> => ({
          ...prisonerSentenceDetailsMock,
          sentenceDetail: {
            ...sentenceDetail,
            automaticReleaseOverrideDate: undefined,
            conditionalReleaseOverrideDate: undefined,
            dtoPostRecallReleaseDateOverride: undefined,
            etdOverrideDate: undefined,
            ltdOverrideDate: undefined,
            mtdOverrideDate: undefined,
            nonParoleOverrideDate: undefined,
            paroleEligibilityOverrideDate: undefined,
            postRecallReleaseOverrideDate: undefined,
            topupSupervisionExpiryOverrideDate: undefined,
          },
        }),
      )
      const offencesPageService = offencesPageServiceConstruct()
      const res = await offencesPageService.getReleaseDates('token', '12345')
      expect(res).toMatchObject({
        automaticReleaseDate: sentenceDetail.automaticReleaseDate,
        conditionalRelease: sentenceDetail.conditionalReleaseDate,
        detentionTrainingOrderPostRecallDate: sentenceDetail.dtoPostRecallReleaseDate,
        earlyTransferDate: sentenceDetail.etdCalculatedDate,
        lateTransferDate: sentenceDetail.ltdCalculatedDate,
        midTransferDate: sentenceDetail.mtdCalculatedDate,
        nonParoleDate: sentenceDetail.nonParoleDate,
        paroleEligibilityCalculatedDate: sentenceDetail.paroleEligibilityCalculatedDate,
        postRecallDate: sentenceDetail.postRecallReleaseDate,
        topupSupervisionExpiryDate: sentenceDetail.topupSupervisionExpiryDate,
      })
    })

    it('should trim empty values', async () => {
      prisonApiClient.getPrisonerSentenceDetails = jest.fn(async () => ({
        ...prisonerSentenceDetailsMock,
        sentenceDetail: { automaticReleaseOverrideDate: 'date' },
      }))
      const offencesPageService = offencesPageServiceConstruct()
      const res = await offencesPageService.getReleaseDates('token', '12345')
      expect(res).toEqual({
        automaticReleaseDate: 'date',
      })
    })
    describe('sed, led, sled', () => {
      it('should use sed if present', async () => {
        prisonApiClient.getPrisonerSentenceDetails = jest.fn(async () => ({
          ...prisonerSentenceDetailsMock,
          sentenceDetail: {
            ...sentenceDetail,
            sentenceExpiryDate: '2016-02-01',
            licenceExpiryDate: '2016-02-02',
          },
        }))
        const offencesPageService = offencesPageServiceConstruct()
        const res = await offencesPageService.getReleaseDates('token', '12345')
        expect(res.sentenceExpiryDate).toEqual(sentenceDetail.sentenceExpiryDate)
        expect(res.licenceExpiryDate).toBeUndefined()
        expect(res.sentenceLicenceExpiryDate).toBeUndefined()
      })

      it('should use led if sed not present', async () => {
        prisonApiClient.getPrisonerSentenceDetails = jest.fn(
          async (): Promise<PrisonerSentenceDetails> => ({
            ...prisonerSentenceDetailsMock,
            sentenceDetail: {
              ...sentenceDetail,
              sentenceExpiryDate: undefined,
              licenceExpiryDate: '2016-02-02',
            },
          }),
        )
        const offencesPageService = offencesPageServiceConstruct()
        const res = await offencesPageService.getReleaseDates('token', '12345')
        expect(res.sentenceExpiryDate).toBeUndefined()
        expect(res.licenceExpiryDate).toEqual(sentenceDetail.licenceExpiryDate)
        expect(res.sentenceLicenceExpiryDate).toBeUndefined()
      })

      it('should use sled if both present and the same', async () => {
        prisonApiClient.getPrisonerSentenceDetails = jest.fn(async () => ({
          ...prisonerSentenceDetailsMock,
          sentenceDetail: {
            ...sentenceDetail,
            sentenceExpiryDate: '2016-02-02',
            licenceExpiryDate: '2016-02-02',
          },
        }))
        const offencesPageService = offencesPageServiceConstruct()
        const res = await offencesPageService.getReleaseDates('token', '12345')
        expect(res.sentenceExpiryDate).toBeUndefined()
        expect(res.licenceExpiryDate).toBeUndefined()
        expect(res.sentenceLicenceExpiryDate).toEqual(sentenceDetail.licenceExpiryDate)
      })

      it('should use none if none present', async () => {
        prisonApiClient.getPrisonerSentenceDetails = jest.fn(
          async (): Promise<PrisonerSentenceDetails> => ({
            ...prisonerSentenceDetailsMock,
            sentenceDetail: {
              ...sentenceDetail,
              sentenceExpiryDate: undefined,
              licenceExpiryDate: undefined,
            },
          }),
        )
        const offencesPageService = offencesPageServiceConstruct()
        const res = await offencesPageService.getReleaseDates('token', '12345')
        expect(res.sentenceExpiryDate).toBeUndefined()
        expect(res.licenceExpiryDate).toBeUndefined()
        expect(res.sentenceLicenceExpiryDate).toBeUndefined()
      })
    })

    describe('non-Dto dates', () => {
      it('should use ARD if type is ARD', async () => {
        prisonApiClient.getPrisonerSentenceDetails = jest.fn(async () => ({
          ...prisonerSentenceDetailsMock,
          sentenceDetail: {
            ...sentenceDetail,
            nonDtoReleaseDate: '2017-02-01',
            nonDtoReleaseDateType: 'ARD' as 'ARD' | 'CRD' | 'NPD' | 'PRRD',
          },
        }))
        const offencesPageService = offencesPageServiceConstruct()
        const res = await offencesPageService.getReleaseDates('token', '12345')
        expect(res.automaticReleaseDateNonDto).toEqual('2017-02-01')
        expect(res.conditionalReleaseNonDto).toBeUndefined()
        expect(res.nonParoleDateNonDto).toBeUndefined()
        expect(res.postRecallDateNonDto).toBeUndefined()
      })

      it('should use CRD if type is CRD', async () => {
        prisonApiClient.getPrisonerSentenceDetails = jest.fn(async () => ({
          ...prisonerSentenceDetailsMock,
          sentenceDetail: {
            ...sentenceDetail,
            nonDtoReleaseDate: '2017-02-01',
            nonDtoReleaseDateType: 'CRD' as 'ARD' | 'CRD' | 'NPD' | 'PRRD',
          },
        }))
        const offencesPageService = offencesPageServiceConstruct()
        const res = await offencesPageService.getReleaseDates('token', '12345')
        expect(res.automaticReleaseDateNonDto).toBeUndefined()
        expect(res.conditionalReleaseNonDto).toEqual('2017-02-01')
        expect(res.nonParoleDateNonDto).toBeUndefined()
        expect(res.postRecallDateNonDto).toBeUndefined()
      })

      it('should use NPD if type is NPD', async () => {
        prisonApiClient.getPrisonerSentenceDetails = jest.fn(async () => ({
          ...prisonerSentenceDetailsMock,
          sentenceDetail: {
            ...sentenceDetail,
            nonDtoReleaseDate: '2017-02-01',
            nonDtoReleaseDateType: 'NPD' as 'ARD' | 'CRD' | 'NPD' | 'PRRD',
          },
        }))
        const offencesPageService = offencesPageServiceConstruct()
        const res = await offencesPageService.getReleaseDates('token', '12345')
        expect(res.automaticReleaseDateNonDto).toBeUndefined()
        expect(res.conditionalReleaseNonDto).toBeUndefined()
        expect(res.nonParoleDateNonDto).toEqual('2017-02-01')
        expect(res.postRecallDateNonDto).toBeUndefined()
      })

      it('should use PRRD if type is PRRD', async () => {
        prisonApiClient.getPrisonerSentenceDetails = jest.fn(async () => ({
          ...prisonerSentenceDetailsMock,
          sentenceDetail: {
            ...sentenceDetail,
            nonDtoReleaseDate: '2017-02-01',
            nonDtoReleaseDateType: 'PRRD' as 'ARD' | 'CRD' | 'NPD' | 'PRRD',
          },
        }))
        const offencesPageService = offencesPageServiceConstruct()
        const res = await offencesPageService.getReleaseDates('token', '12345')
        expect(res.automaticReleaseDateNonDto).toBeUndefined()
        expect(res.conditionalReleaseNonDto).toBeUndefined()
        expect(res.nonParoleDateNonDto).toBeUndefined()
        expect(res.postRecallDateNonDto).toEqual('2017-02-01')
      })

      it('should use none if no type', async () => {
        prisonApiClient.getPrisonerSentenceDetails = jest.fn(
          async (): Promise<PrisonerSentenceDetails> => ({
            ...prisonerSentenceDetailsMock,
            sentenceDetail: {
              ...sentenceDetail,
              nonDtoReleaseDate: '2016-02-01',
              nonDtoReleaseDateType: undefined,
            },
          }),
        )
        const offencesPageService = offencesPageServiceConstruct()
        const res = await offencesPageService.getReleaseDates('token', '12345')
        expect(res.automaticReleaseDateNonDto).toBeUndefined()
        expect(res.conditionalReleaseNonDto).toBeUndefined()
        expect(res.nonParoleDateNonDto).toBeUndefined()
        expect(res.postRecallDateNonDto).toBeUndefined()
      })

      it('should use none if no date', async () => {
        prisonApiClient.getPrisonerSentenceDetails = jest.fn(
          async (): Promise<PrisonerSentenceDetails> => ({
            ...prisonerSentenceDetailsMock,
            sentenceDetail: {
              ...sentenceDetail,
              nonDtoReleaseDate: undefined,
              nonDtoReleaseDateType: 'ARD' as 'ARD' | 'CRD' | 'NPD' | 'PRRD',
            },
          }),
        )
        const offencesPageService = offencesPageServiceConstruct()
        const res = await offencesPageService.getReleaseDates('token', '12345')
        expect(res.automaticReleaseDateNonDto).toBeUndefined()
        expect(res.conditionalReleaseNonDto).toBeUndefined()
        expect(res.nonParoleDateNonDto).toBeUndefined()
        expect(res.postRecallDateNonDto).toBeUndefined()
      })

      it('should use none if no date if crd type and conditionalReleaseDate is the same', async () => {
        prisonApiClient.getPrisonerSentenceDetails = jest.fn(async () => ({
          ...prisonerSentenceDetailsMock,
          sentenceDetail: {
            ...sentenceDetail,
            conditionalReleaseDate: '2012-01-01',
            nonDtoReleaseDate: '2012-01-01',
            nonDtoReleaseDateType: 'CRD' as 'ARD' | 'CRD' | 'NPD' | 'PRRD',
          },
        }))
        const offencesPageService = offencesPageServiceConstruct()
        const res = await offencesPageService.getReleaseDates('token', '12345')
        expect(res.conditionalReleaseNonDto).toBeUndefined()
      })

      it('should use none if no date if ard type and automaticReleaseDate is the same', async () => {
        prisonApiClient.getPrisonerSentenceDetails = jest.fn(async () => ({
          ...prisonerSentenceDetailsMock,
          sentenceDetail: {
            ...sentenceDetail,
            automaticReleaseDate: '2012-01-01',
            nonDtoReleaseDate: '2012-01-01',
            nonDtoReleaseDateType: 'CRD' as 'ARD' | 'CRD' | 'NPD' | 'PRRD',
          },
        }))
        const offencesPageService = offencesPageServiceConstruct()
        const res = await offencesPageService.getReleaseDates('token', '12345')
        expect(res.automaticReleaseDateNonDto).toBeUndefined()
      })

      it('should use none if NPD type and nonParoleDate is the same', async () => {
        prisonApiClient.getPrisonerSentenceDetails = jest.fn(async () => ({
          ...prisonerSentenceDetailsMock,
          sentenceDetail: {
            ...sentenceDetail,
            nonParoleDate: '2012-01-01',
            nonDtoReleaseDate: '2012-01-01',
            nonDtoReleaseDateType: 'NPD' as 'ARD' | 'CRD' | 'NPD' | 'PRRD',
          },
        }))
        const offencesPageService = offencesPageServiceConstruct()
        const res = await offencesPageService.getReleaseDates('token', '12345')
        expect(res.nonParoleDateNonDto).toBeUndefined()
      })

      it('should use none if PRRD type and postRecallReleaseDate is the same', async () => {
        prisonApiClient.getPrisonerSentenceDetails = jest.fn(async () => ({
          ...prisonerSentenceDetailsMock,
          sentenceDetail: {
            ...sentenceDetail,
            postRecallReleaseDate: '2012-01-01',
            nonDtoReleaseDate: '2012-01-01',
            nonDtoReleaseDateType: 'PRD' as 'ARD' | 'CRD' | 'NPD' | 'PRRD',
          },
        }))
        const offencesPageService = offencesPageServiceConstruct()
        const res = await offencesPageService.getReleaseDates('token', '12345')
        expect(res.postRecallDateNonDto).toBeUndefined()
      })
    })
  })
})
