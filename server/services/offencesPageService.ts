import { format, startOfToday } from 'date-fns'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { Prisoner } from '../interfaces/prisoner'
import { formatCurrency } from '../utils/utils'
import { formatDate } from '../utils/dateHelpers'
import { PrisonerSentenceDetails } from '../interfaces/prisonerSentenceDetails'
import { CourtHearing } from '../interfaces/prisonApi/courtHearing'
import { FindConsecutiveSentence, Licence, OffenderSentenceTerms } from '../interfaces/prisonApi/offenderSentenceTerms'
import { GroupedSentence } from '../interfaces/groupSentencesBySequence'
import { OffenceHistoryDetail } from '../interfaces/prisonApi/offenceHistoryDetail'
import { Charge } from '../data/enums/chargeCodes'
import { CourtCase } from '../interfaces/prisonApi/courtCase'
import { CourtDateResults } from '../interfaces/courtDateResults'
import { CourtCaseDataMapped, CourtCaseDataMappedUnsentenced } from '../interfaces/courtCaseDataMapped'

export default class OffencesPageService {
  private prisonApiClient: PrisonApiClient

  constructor(prisonApiClient: PrisonApiClient) {
    this.prisonApiClient = prisonApiClient
  }

  public async get(prisonerData: Prisoner) {
    const { prisonerNumber, bookingId } = prisonerData
    const [courtCaseData, releaseDates] = await Promise.all([
      this.getCourtCasesData(bookingId, prisonerNumber),
      this.getReleaseDates(prisonerNumber),
    ])

    const courtCasesSentenceDetailsId =
      releaseDates.dates.length > 0 ? 'court-cases-sentence-details' : 'court-cases-upcoming-appearances'

    return {
      courtCaseData,
      releaseDates,
      courtCasesSentenceDetailsId,
    }
  }

  getLengthTextLabels(data: Licence | OffenderSentenceTerms) {
    const { years, months, weeks, days } = data
    const yearsLabel = years > 0 && `${years} ${years === 1 ? 'year' : 'years'}`
    const monthsLabel = months > 0 && `${months} ${months === 1 ? 'month' : 'months'}`
    const weeksLabel = weeks > 0 && `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`
    const daysLabel = days > 0 && `${days} ${days === 1 ? 'day' : 'days'}`
    return [yearsLabel, monthsLabel, weeksLabel, daysLabel].filter(label => label).join(', ')
  }

  mergeMostRecentLicenceTerm(sentences: OffenderSentenceTerms[]) {
    return sentences.reduce((result: OffenderSentenceTerms, current: OffenderSentenceTerms) => {
      if (current.sentenceTermCode === 'IMP' && !result) return current
      if (current.sentenceTermCode === 'LIC' && !result?.licence) {
        return {
          licence: {
            years: current.years,
            months: current.months,
            weeks: current.weeks,
            days: current.days,
          },
          ...result,
        }
      }
      return result
    }, null)
  }

  groupSentencesBySequence(sentences: OffenderSentenceTerms[]) {
    return sentences.reduce((result: GroupedSentence[], current: OffenderSentenceTerms) => {
      const key = current.lineSeq
      const existing = result.find((groupedSentence: GroupedSentence) => groupedSentence.key === key)

      if (existing) {
        return [
          { ...existing, items: [...existing.items, current] },
          ...result.filter((entry: GroupedSentence) => entry.key !== key),
        ]
      }
      return [{ key, caseId: current.caseId, items: [current], summaryListRows: [] }, ...result]
    }, [])
  }

  findConsecutiveSentence({ sentences, consecutiveTo }: FindConsecutiveSentence) {
    const sentence: OffenderSentenceTerms = sentences.find(
      // eslint-disable-next-line no-shadow
      (sentences: OffenderSentenceTerms) => sentences.sentenceSequence === consecutiveTo,
    )
    return sentence && sentence.lineSeq ? 'Consecutive' : 'Concurrent'
  }

  chargeCodesFilter(offenceHistory: OffenceHistoryDetail[]) {
    return offenceHistory
      .filter(offence =>
        [
          Charge.Code_1002.toString(),
          Charge.Code_1501.toString(),
          Charge.Code_1510.toString(),
          Charge.Code_1024.toString(),
          Charge.Code_3045.toString(),
          Charge.Code_1046.toString(),
          Charge.Code_1081.toString(),
          Charge.Code_1003.toString(),
          Charge.Code_2003.toString(),
        ].includes(offence.primaryResultCode),
      )
      .map(offence => offence.caseId)
  }

  async getCourtCasesData(bookingId: number, prisonerNumber: string) {
    const [courtCaseData, offenceHistory, sentenceTermsData, courtDateResults] = await Promise.all([
      this.prisonApiClient.getCourtCases(bookingId),
      this.prisonApiClient.getOffenceHistory(prisonerNumber),
      this.prisonApiClient.getSentenceTerms(bookingId),
      this.prisonApiClient.getCourtDateResults(prisonerNumber),
    ])

    const caseIds = [...new Set(this.chargeCodesFilter(offenceHistory))]
    const todaysDate = format(startOfToday(), 'yyyy-MM-dd')

    const courtCaseDataMapped: CourtCaseDataMapped[] = this.getMapForSentencedCourtCases(
      courtCaseData,
      caseIds,
      todaysDate,
      sentenceTermsData,
      offenceHistory,
      courtDateResults,
    )

    const courtCaseDataMappedUnsentenced: CourtCaseDataMappedUnsentenced[] = this.getMapForUnsentencedCourtCases(
      courtCaseData,
      todaysDate,
      courtDateResults,
      courtCaseDataMapped,
    )

    return [...courtCaseDataMapped, ...courtCaseDataMappedUnsentenced]
  }

  getNextCourtAppearance(courtCase: CourtCase, todaysDate: string) {
    let nextCourtAppearance: CourtHearing = {} as CourtHearing
    courtCase.courtHearings.forEach((courtHearing: CourtHearing) => {
      const courtCaseDate = format(new Date(courtHearing.dateTime), 'yyyy-MM-dd')
      if (nextCourtAppearance.dateTime === undefined) {
        if (courtCaseDate > todaysDate || courtCaseDate === todaysDate) {
          nextCourtAppearance = courtHearing
        }
      } else {
        const nextCourtCaseDate = format(new Date(nextCourtAppearance.dateTime), 'yyyy-MM-dd')
        if (courtCaseDate > todaysDate || courtCaseDate === todaysDate) {
          if (courtCaseDate < nextCourtCaseDate) {
            nextCourtAppearance = courtHearing
          }
        }
      }
    })
    return nextCourtAppearance
  }

  getCountDisplayText(count: number) {
    return `Count ${count}`
  }

  getCourtHearings(courtCase: CourtCase) {
    return courtCase.courtHearings
  }

  getCourtInfoNumber(courtCase: CourtCase) {
    return courtCase.caseInfoNumber || 'Not entered'
  }

  getCourtName(courtCase: CourtCase) {
    return courtCase.agency && courtCase.agency.description
  }

  getCountForUnsentencedCourtCase(courtCase: CourtCase) {
    return this.getCountDisplayText(courtCase.caseSeq)
  }

  getCountForSentencedCourtCase(sentence: OffenderSentenceTerms) {
    return this.getCountDisplayText(sentence.lineSeq)
  }

  getOffences(courtCase: CourtCase, offenceHistory: OffenceHistoryDetail[], courtDateResults: CourtDateResults[]) {
    return [
      ...new Set(
        offenceHistory
          .filter(offence => offence.caseId === courtCase.id)
          .filter(offence => {
            const courtDateResultsLocal = courtDateResults?.filter(
              courtDateResult => courtDateResult.charge.courtCaseId === courtCase.id,
            )
            const finalOffences: OffenceHistoryDetail[] = []
            if (courtDateResults) {
              courtDateResultsLocal.forEach(courtDateResultLocal => {
                if (courtDateResultLocal.charge.offenceCode === offence.offenceCode) {
                  finalOffences.push(offence)
                }
              })
            }
            return finalOffences
          }),
      ),
    ]
  }

  getSummaryDetailRow(sentence: OffenderSentenceTerms, sentenceTermsData: OffenderSentenceTerms[]) {
    return [
      {
        label: 'Sentence date',
        value: formatDate(sentence.sentenceStartDate && sentence.sentenceStartDate, 'long'),
      },
      {
        label: 'Length',
        value: this.getLengthTextLabels(sentence),
      },
      {
        label: 'Concurrent or consecutive',
        value: this.findConsecutiveSentence({
          sentences: sentenceTermsData,
          consecutiveTo: sentence.consecutiveTo,
        }),
      },
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
      sentence.fineAmount && { label: 'Fine', value: formatCurrency(sentence.fineAmount) },
      sentence.licence && {
        label: 'Licence',
        value: this.getLengthTextLabels(sentence.licence),
      },
    ]
  }

  getSentenceTerms(
    courtCase: CourtCase,
    sentenceTermsData: OffenderSentenceTerms[],
    offenceHistory: OffenceHistoryDetail[],
    courtDateResults: CourtDateResults[],
  ) {
    return this.groupSentencesBySequence(sentenceTermsData)
      .filter((group: GroupedSentence) => Number(group.caseId) === courtCase.id)
      .map((groupedSentence: GroupedSentence) => this.mergeMostRecentLicenceTerm(groupedSentence.items))
      .map((sentence: OffenderSentenceTerms) => ({
        sentenceHeader: this.getCountForSentencedCourtCase(sentence),
        sentenceTypeDescription: sentence.sentenceTypeDescription,
        summaryDetailRows: this.getSummaryDetailRow(sentence, sentenceTermsData),
        offences: this.getOffences(courtCase, offenceHistory, courtDateResults),
      }))
  }

  getUniqueChargesFromCourtDateResults(courtDateResults: CourtDateResults[]) {
    return [...new Map(courtDateResults?.map(item => [item.charge.chargeId, item])).values()]
  }

  getMapForUnsentencedCourtCases(
    courtCaseData: CourtCase[],
    todaysDate: string,
    courtDateResults: CourtDateResults[],
    courtCaseDataMapped: CourtCaseDataMapped[],
  ) {
    return (
      courtCaseData
        .map(courtCase => ({
          ...this.getGenericMaps(courtCase, todaysDate),
          sentenced: false,
          sentenceHeader: this.getCountForUnsentencedCourtCase(courtCase),
          courtDateResults: this.getUniqueChargesFromCourtDateResults(courtDateResults)?.filter(
            courtDateResult => courtDateResult.charge.courtCaseId === courtCase.id,
          ),
        }))
        // Hide unsentenced court cases if sentenced court case is available
        // eslint-disable-next-line array-callback-return,consistent-return
        .filter(value => {
          if (
            !courtCaseDataMapped.filter(
              courtCaseDataSentenced => courtCaseDataSentenced.caseInfoNumber === value.caseInfoNumber,
            ) ||
            courtCaseDataMapped.length === 0
          ) {
            return value
          }
        })
    )
  }

  getGenericMaps(courtCase: CourtCase, todaysDate: string) {
    return {
      nextCourtAppearance: this.getNextCourtAppearance(courtCase, todaysDate),
      courtHearings: this.getCourtHearings(courtCase),
      courtName: this.getCourtName(courtCase),
      caseInfoNumber: this.getCourtInfoNumber(courtCase),
    }
  }

  getMapForSentencedCourtCases(
    courtCaseData: CourtCase[],
    caseIds: number[],
    todaysDate: string,
    sentenceTermsData: OffenderSentenceTerms[],
    offenceHistory: OffenceHistoryDetail[],
    courtDateResults: CourtDateResults[],
  ) {
    return courtCaseData
      .filter(courtCase => caseIds.includes(courtCase.id))
      .map(courtCase => ({
        ...this.getGenericMaps(courtCase, todaysDate),
        sentenced: true,
        sentenceTerms: this.getSentenceTerms(courtCase, sentenceTermsData, offenceHistory, courtDateResults),
      }))
      .filter(courtCase => courtCase.sentenceTerms.length)
      .map(courtCase => {
        return {
          ...courtCase,
        }
      })
  }

  async getReleaseDates(prisonerNumber: string) {
    const releaseDates: PrisonerSentenceDetails = await this.prisonApiClient.getPrisonerSentenceDetails(prisonerNumber)
    const sentenceDetails = releaseDates.sentenceDetail
    const conditionalRelease: string =
      sentenceDetails.conditionalReleaseOverrideDate || sentenceDetails.conditionalReleaseDate
    const postRecallDate = sentenceDetails.postRecallReleaseOverrideDate || sentenceDetails.postRecallReleaseDate
    const automaticReleaseDate = sentenceDetails.automaticReleaseOverrideDate || sentenceDetails.automaticReleaseDate
    const nonParoleDate = sentenceDetails.nonParoleOverrideDate || sentenceDetails.nonParoleDate
    const detentionTrainingOrderPostRecallDate =
      sentenceDetails.dtoPostRecallReleaseDateOverride || sentenceDetails.dtoPostRecallReleaseDate

    return {
      dates: [
        ...(sentenceDetails.homeDetentionCurfewActualDate
          ? [
              {
                key: {
                  text: 'Approved for home detention curfew',
                },
                value: {
                  text: formatDate(sentenceDetails.homeDetentionCurfewActualDate, 'long'),
                },
              },
            ]
          : []),
        ...(conditionalRelease
          ? [
              {
                key: {
                  text: 'Conditional release',
                },
                value: {
                  text: formatDate(conditionalRelease, 'long'),
                },
              },
            ]
          : []),
        ...(postRecallDate
          ? [
              {
                key: {
                  text: 'Post recall release',
                },
                value: {
                  text: formatDate(postRecallDate, 'long'),
                },
              },
            ]
          : []),
        ...(sentenceDetails.midTermDate
          ? [
              {
                key: {
                  text: 'Mid transfer',
                },
                value: {
                  text: formatDate(sentenceDetails.midTermDate, 'long'),
                },
              },
            ]
          : []),
        ...(automaticReleaseDate
          ? [
              {
                key: {
                  text: 'Automatic release',
                },
                value: {
                  text: formatDate(automaticReleaseDate, 'long'),
                },
              },
            ]
          : []),
        ...(nonParoleDate
          ? [
              {
                key: {
                  text: 'Non parole',
                },
                value: {
                  text: formatDate(nonParoleDate, 'long'),
                },
              },
            ]
          : []),
        ...(detentionTrainingOrderPostRecallDate
          ? [
              {
                key: {
                  text: 'Detention training post recall',
                },
                value: {
                  text: formatDate(detentionTrainingOrderPostRecallDate, 'long'),
                },
              },
            ]
          : []),
        ...(sentenceDetails.paroleEligibilityDate
          ? [
              {
                key: {
                  text: 'Parole eligibility',
                },
                value: {
                  text: formatDate(sentenceDetails.paroleEligibilityDate, 'long'),
                },
              },
            ]
          : []),
        ...(sentenceDetails.homeDetentionCurfewEligibilityDate
          ? [
              {
                key: {
                  text: 'Home detention curfew',
                },
                value: {
                  text: formatDate(sentenceDetails.homeDetentionCurfewEligibilityDate, 'long'),
                },
              },
            ]
          : []),
        ...(sentenceDetails.releaseOnTemporaryLicenceDate
          ? [
              {
                key: {
                  text: 'Release on temporary licence',
                },
                value: {
                  text: formatDate(sentenceDetails.releaseOnTemporaryLicenceDate, 'long'),
                },
              },
            ]
          : []),
        ...(sentenceDetails.earlyRemovalSchemeEligibilityDate
          ? [
              {
                key: {
                  text: 'Early removal scheme',
                },
                value: {
                  text: formatDate(sentenceDetails.earlyRemovalSchemeEligibilityDate, 'long'),
                },
              },
            ]
          : []),
        ...(sentenceDetails.tariffEarlyRemovalSchemeEligibilityDate
          ? [
              {
                key: {
                  text: 'Tariff early removal scheme',
                },
                value: {
                  text: formatDate(sentenceDetails.tariffEarlyRemovalSchemeEligibilityDate, 'long'),
                },
              },
            ]
          : []),
        ...(sentenceDetails.actualParoleDate
          ? [
              {
                key: {
                  text: 'Approved for parole',
                },
                value: {
                  text: formatDate(sentenceDetails.actualParoleDate, 'long'),
                },
              },
            ]
          : []),
        ...(sentenceDetails.earlyTermDate
          ? [
              {
                key: {
                  text: 'Early transfer',
                },
                value: {
                  text: formatDate(sentenceDetails.earlyTermDate, 'long'),
                },
              },
            ]
          : []),
        ...(sentenceDetails.topupSupervisionExpiryDate
          ? [
              {
                key: {
                  text: 'Top up supervision expiry',
                },
                value: {
                  text: formatDate(sentenceDetails.topupSupervisionExpiryDate, 'long'),
                },
              },
            ]
          : []),
        ...(sentenceDetails.lateTermDate
          ? [
              {
                key: {
                  text: 'Late transfer',
                },
                value: {
                  text: formatDate(sentenceDetails.lateTermDate, 'long'),
                },
              },
            ]
          : []),
        ...(sentenceDetails.tariffDate
          ? [
              {
                key: {
                  text: 'Tariff',
                },
                value: {
                  text: formatDate(sentenceDetails.tariffDate, 'long'),
                },
              },
            ]
          : []),
      ],
    }
  }
}
