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
import { CourtCaseDataMappedUnsentenced } from '../interfaces/courtCaseDataMapped'
import {
  SentenceSummary,
  SentenceSummaryCourtCaseExtended,
  SentenceSummaryCourtSentence,
  SentenceSummaryTermDetail,
} from '../interfaces/prisonApi/sentenceSummary'
import { RestClientBuilder } from '../data'

export default class OffencesPageService {
  private prisonApiClient: PrisonApiClient

  constructor(private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>) {}

  public async get(token: string, prisonerData: Prisoner) {
    this.prisonApiClient = this.prisonApiClientBuilder(token)
    const { prisonerNumber, bookingId } = prisonerData
    const [courtCaseData, releaseDates] = await Promise.all([
      this.getCourtCasesData(token, bookingId, prisonerNumber),
      this.getReleaseDates(token, prisonerNumber),
    ])

    if (courtCaseData && releaseDates) {
      const courtCasesSentenceDetailsId =
        releaseDates.dates.length > 0 ? 'court-cases-sentence-details' : 'court-cases-upcoming-appearances'

      return {
        courtCaseData,
        releaseDates,
        courtCasesSentenceDetailsId,
      }
    }
    return {}
  }

  getLengthTextLabels(data: Licence | OffenderSentenceTerms | SentenceSummaryTermDetail) {
    const { years, months, weeks, days } = data
    const yearsLabel = years > 0 && `${years} ${years === 1 ? 'year' : 'years'}`
    const monthsLabel = months > 0 && `${months} ${months === 1 ? 'month' : 'months'}`
    const weeksLabel = weeks > 0 && `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`
    const daysLabel = days > 0 && `${days} ${days === 1 ? 'day' : 'days'}`
    return [yearsLabel, monthsLabel, weeksLabel, daysLabel].filter(label => label).join(', ')
  }

  mergeMostRecentLicenceTerm(sentences: OffenderSentenceTerms[] | SentenceSummaryTermDetail[]) {
    return sentences.reduce(
      (result: OffenderSentenceTerms, current: OffenderSentenceTerms | SentenceSummaryTermDetail) => {
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
      },
      null,
    )
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
    const sentence: OffenderSentenceTerms | SentenceSummaryCourtSentence = sentences.find(
      // eslint-disable-next-line no-shadow
      (sentences: OffenderSentenceTerms | SentenceSummaryCourtSentence) => sentences.sentenceSequence === consecutiveTo,
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

  async getCourtCasesData(token: string, bookingId: number, prisonerNumber: string) {
    this.prisonApiClient = this.prisonApiClient ? this.prisonApiClient : this.prisonApiClientBuilder(token)
    const [courtCaseData, offenceHistory, sentenceTermsData, courtDateResults, sentenceSummary] = await Promise.all([
      this.prisonApiClient.getCourtCases(bookingId),
      this.prisonApiClient.getOffenceHistory(prisonerNumber),
      this.prisonApiClient.getSentenceTerms(bookingId),
      this.prisonApiClient.getCourtDateResults(prisonerNumber),
      this.prisonApiClient.getSentenceSummary(prisonerNumber),
    ])

    const caseIds = [...new Set(this.chargeCodesFilter(offenceHistory))]
    const todaysDate = format(startOfToday(), 'yyyy-MM-dd')

    const summarySentencedCourtCasesMapped = this.getMapForSentenceSummaryCourtCases(
      courtCaseData,
      caseIds,
      offenceHistory,
      sentenceSummary,
      sentenceTermsData,
    )

    const courtCaseIdsToExclude: number[] = [] as number[]

    summarySentencedCourtCasesMapped.forEach(sentenceSummaryCourtCase => {
      courtCaseIdsToExclude.push(sentenceSummaryCourtCase.id)
    })

    const courtCaseDataMappedUnsentenced: CourtCaseDataMappedUnsentenced[] = this.getMapForUnsentencedCourtCases(
      courtCaseData,
      todaysDate,
      courtDateResults,
      courtCaseIdsToExclude,
    )

    return [...summarySentencedCourtCasesMapped, ...courtCaseDataMappedUnsentenced]
  }

  getNextCourtAppearance(courtCase: CourtCase, todaysDate: string) {
    let nextCourtAppearance: CourtHearing = {} as CourtHearing
    if (courtCase.courtHearings) {
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
    }
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
    let courtName: string
    if (courtCase.agency && courtCase.agency.description) {
      courtName = courtCase.agency.description
      return courtName
    }
    if (courtCase.court && courtCase.court.description) {
      courtName = courtCase.court.description
      return courtName
    }
    courtName = undefined
    return courtName
  }

  getCountForUnsentencedCourtCase(courtCase: CourtCase) {
    return this.getCountDisplayText(courtCase.caseSeq)
  }

  getCountForSentencedCourtCase(sentence: OffenderSentenceTerms) {
    return this.getCountDisplayText(sentence.lineSeq)
  }

  getOffences(
    courtCase: CourtCase,
    offenceHistory: OffenceHistoryDetail[],
    courtDateResults: CourtDateResults[],
    sentenceSummary: SentenceSummary,
  ) {
    return [
      ...new Set(
        offenceHistory
          .filter(offence => offence.caseId === courtCase.id)
          .filter(offenceFromHistory => {
            const courtDateResultsLocal = courtDateResults?.filter(
              courtDateResult => courtDateResult.charge.courtCaseId === courtCase.id,
            )
            const finalOffences: OffenceHistoryDetail[] = []
            if (courtDateResults) {
              courtDateResultsLocal.forEach(courtDateResultLocal => {
                if (courtDateResultLocal.charge.offenceCode === offenceFromHistory.offenceCode) {
                  sentenceSummary.latestPrisonTerm.courtSentences.forEach(courtCaseObj => {
                    courtCaseObj.sentences.forEach(sentence => {
                      sentence.offences.forEach(offenceFromSentenceSummary => {
                        if (offenceFromHistory.offenceCode === offenceFromSentenceSummary.offenceCode) {
                          finalOffences.push(offenceFromHistory)
                        }
                      })
                    })
                  })
                }
              })
            }
            return finalOffences
          }),
      ),
    ]
  }

  getUniqueChargesFromCourtDateResults(courtDateResults: CourtDateResults[]) {
    return [...new Map(courtDateResults?.map(item => [item.charge.chargeId, item])).values()]
  }

  getMapForUnsentencedCourtCases(
    courtCaseData: CourtCase[],
    todaysDate: string,
    courtDateResults: CourtDateResults[],
    courtCaseIdsToExclude: number[],
  ) {
    return courtCaseData
      .filter(courtCase => !courtCaseIdsToExclude.includes(courtCase.id))
      .map(courtCase => ({
        ...this.getGenericMaps(courtCase, todaysDate),
        sentenced: false,
        sentenceHeader: this.getCountForUnsentencedCourtCase(courtCase),
        courtDateResults: this.getUniqueChargesFromCourtDateResults(courtDateResults)?.filter(
          courtDateResult => courtDateResult.charge.courtCaseId === courtCase.id,
        ),
      }))
  }

  getGenericMaps(courtCase: CourtCase, todaysDate: string) {
    return {
      nextCourtAppearance: this.getNextCourtAppearance(courtCase, todaysDate),
      courtHearings: this.getCourtHearings(courtCase),
      courtName: this.getCourtName(courtCase),
      caseInfoNumber: this.getCourtInfoNumber(courtCase),
      id: courtCase.id,
    }
  }

  getMapForSentenceSummaryCourtCases(
    courtCaseData: CourtCase[],
    caseIds: number[],
    offenceHistory: OffenceHistoryDetail[],
    sentenceSummary: SentenceSummary,
    sentenceTermsData: OffenderSentenceTerms[],
  ) {
    return this.getSentenceSummaryMapped(sentenceSummary, offenceHistory, courtCaseData, sentenceTermsData).filter(
      courtCase => caseIds.includes(courtCase.id),
    )
  }
  /* eslint-disable no-param-reassign */

  getSentenceSummaryMapped(
    sentenceSummary: SentenceSummary,
    offenceHistory: OffenceHistoryDetail[],
    courtCaseData: CourtCase[],
    sentenceTermsData: OffenderSentenceTerms[],
  ) {
    const sentencedCourtCases: SentenceSummaryCourtCaseExtended[] = sentenceSummary.latestPrisonTerm.courtSentences

    return sentencedCourtCases.map(courtSentence => {
      courtSentence.sentences.forEach((sentence, i) => {
        sentence.offences.forEach((sentenceOffence, j) => {
          offenceHistory.forEach(offence => {
            if (
              offence.offenceDate === sentenceOffence.offenceStartDate &&
              offence.offenceCode === sentenceOffence.offenceCode
            ) {
              courtSentence.sentences[i].offences[j].offenceRangeDate = offence.offenceRangeDate
              courtSentence.sentences[i].offences[j].offenceDate = offence.offenceDate
              courtSentence.sentences[i].offences[j].statuteCode = offence.statuteCode
            }
            return courtSentence
          })
        })
      })

      const mostRecentLicenceTerms = this.groupSentencesBySequence(sentenceTermsData)
        .filter((group: GroupedSentence) => Number(group.caseId) === courtSentence.id)
        .map((groupedSentence: GroupedSentence) => this.mergeMostRecentLicenceTerm(groupedSentence.items))

      courtCaseData.forEach(courtCase => {
        if (courtCase.caseInfoNumber === courtSentence.caseInfoNumber && courtCase.courtHearings) {
          courtSentence.courtHearings = courtCase.courtHearings
        }
      })
      courtSentence.sentences.map(sentenceValue => {
        sentenceValue.sentenceHeader = this.getCountDisplayText(sentenceValue.lineSeq)
        // eslint-disable-next-line  no-self-assign
        sentenceValue.sentenceTypeDescription = sentenceValue.sentenceTypeDescription
        sentenceValue.sentenced = true
        sentenceValue.sentenceStartDate = formatDate(
          sentenceValue.sentenceStartDate && sentenceValue.sentenceStartDate,
          'long',
        )
        sentenceValue.sentenceLength =
          sentenceValue && sentenceValue.terms ? this.getLengthTextLabels(sentenceValue.terms[0]) : undefined
        sentenceValue.concurrentConsecutive = this.findConsecutiveSentence({
          sentences: sentenceTermsData,
          consecutiveTo: sentenceValue.consecutiveToSequence,
        })
        // eslint-disable-next-line no-unused-expressions
        sentenceValue.fineAmount
          ? (sentenceValue.fineAmountFormat = formatCurrency(sentenceValue.fineAmount, 'GBP').toString())
          : undefined
        mostRecentLicenceTerms.forEach(term => {
          if (
            Number(term.caseId) === courtSentence.id &&
            sentenceValue.sentenceTypeDescription === term.sentenceTypeDescription
          ) {
            if (term && term.licence) {
              sentenceValue.sentenceLicence = this.getLengthTextLabels(term.licence)
            }
          }
        })
        return sentenceValue
      })
      return courtSentence
    })
  }

  async getReleaseDates(token: string, prisonerNumber: string) {
    this.prisonApiClient = this.prisonApiClient ? this.prisonApiClient : this.prisonApiClientBuilder(token)
    const releaseDates: PrisonerSentenceDetails = await this.prisonApiClient.getPrisonerSentenceDetails(prisonerNumber)

    if (releaseDates.sentenceDetail) {
      const sentenceDetails = releaseDates.sentenceDetail
      const conditionalRelease: string =
        sentenceDetails.conditionalReleaseOverrideDate || sentenceDetails.conditionalReleaseDate
      const postRecallDate = sentenceDetails.postRecallReleaseOverrideDate || sentenceDetails.postRecallReleaseDate
      const automaticReleaseDate = sentenceDetails.automaticReleaseOverrideDate || sentenceDetails.automaticReleaseDate
      const nonParoleDate = sentenceDetails.nonParoleOverrideDate || sentenceDetails.nonParoleDate
      const detentionTrainingOrderPostRecallDate =
        sentenceDetails.dtoPostRecallReleaseDateOverride || sentenceDetails.dtoPostRecallReleaseDate
      const paroleEligibilityCalculatedDate: string =
        sentenceDetails.paroleEligibilityOverrideDate || sentenceDetails.paroleEligibilityCalculatedDate
      const topupSupervisionExpiryDate: string =
        sentenceDetails.topupSupervisionExpiryOverrideDate || sentenceDetails.topupSupervisionExpiryDate
      const earlyTransferDate: string = sentenceDetails.etdOverrideDate || sentenceDetails.etdCalculatedDate
      const midTransferDate: string = sentenceDetails.mtdOverrideDate || sentenceDetails.mtdCalculatedDate
      const lateTransferDate: string = sentenceDetails.ltdOverrideDate || sentenceDetails.ltdCalculatedDate
      return {
        dates: [
          ...(sentenceDetails.homeDetentionCurfewActualDate
            ? [
                {
                  key: {
                    text: 'Home Detention Curfew approved date (HDCAD)',
                  },
                  value: {
                    text: formatDate(sentenceDetails.homeDetentionCurfewActualDate, 'long'),
                  },
                },
              ]
            : []),
          ...(automaticReleaseDate
            ? [
                {
                  key: {
                    text: 'Automatic release date (ARD)',
                  },
                  value: {
                    text: formatDate(automaticReleaseDate, 'long'),
                  },
                },
              ]
            : []),
          ...(conditionalRelease
            ? [
                {
                  key: {
                    text: 'Conditional release date (CRD)',
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
                    text: 'Post-recall release date (PRRD)',
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
                    text: 'Mid-term date (MTD)',
                  },
                  value: {
                    text: formatDate(sentenceDetails.midTermDate, 'long'),
                  },
                },
              ]
            : []),
          ...(nonParoleDate
            ? [
                {
                  key: {
                    text: 'Non-parole date (NPD)',
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
                    text: 'Detention and training order post-recall release date (DTOPRRD)',
                  },
                  value: {
                    text: formatDate(detentionTrainingOrderPostRecallDate, 'long'),
                  },
                },
              ]
            : []),
          ...(sentenceDetails.homeDetentionCurfewEligibilityDate
            ? [
                {
                  key: {
                    text: 'Home detention curfew eligibility date (HDCED)',
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
                    text: 'Release on temporary licence (ROTL)',
                  },
                  value: {
                    text: formatDate(sentenceDetails.releaseOnTemporaryLicenceDate, 'long'),
                  },
                },
              ]
            : []),
          ...(sentenceDetails.tariffEarlyRemovalSchemeEligibilityDate
            ? [
                {
                  key: {
                    text: 'Tariff Expired Removal Scheme eligibility date (TERSED)',
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
                    text: 'Approved parole date (APD)',
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
                    text: 'Early-term date (ETD)',
                  },
                  value: {
                    text: formatDate(sentenceDetails.earlyTermDate, 'long'),
                  },
                },
              ]
            : []),
          ...(sentenceDetails.lateTermDate
            ? [
                {
                  key: {
                    text: 'Late-term date (LTD)',
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
          ...(sentenceDetails.actualParoleDate
            ? [
                {
                  key: {
                    text: 'Approved parole date (APD)',
                  },
                  value: {
                    text: formatDate(sentenceDetails.actualParoleDate, 'long'),
                  },
                },
              ]
            : []),
          ...(detentionTrainingOrderPostRecallDate
            ? [
                {
                  key: {
                    text: 'Detention and training order post-recall release date (DTOPRRD)',
                  },
                  value: {
                    text: formatDate(detentionTrainingOrderPostRecallDate, 'long'),
                  },
                },
              ]
            : []),
          ...(sentenceDetails.nonDtoReleaseDate
            ? [
                {
                  key: {
                    text: 'Detention post-recall release date (DPRRD)',
                  },
                  value: {
                    text: formatDate(sentenceDetails.nonDtoReleaseDate, 'long'),
                  },
                },
              ]
            : []),
          ...(sentenceDetails.earlyRemovalSchemeEligibilityDate
            ? [
                {
                  key: {
                    text: 'Early Removal Scheme eligibility date (ERSED)',
                  },
                  value: {
                    text: formatDate(sentenceDetails.earlyRemovalSchemeEligibilityDate, 'long'),
                  },
                },
              ]
            : []),
          ...(sentenceDetails.effectiveSentenceEndDate
            ? [
                {
                  key: {
                    text: 'Effective sentence end date (ESED)',
                  },
                  value: {
                    text: formatDate(sentenceDetails.effectiveSentenceEndDate, 'long'),
                  },
                },
              ]
            : []),
          ...(paroleEligibilityCalculatedDate
            ? [
                {
                  key: {
                    text: 'Parole eligibility date (PED)',
                  },
                  value: {
                    text: formatDate(paroleEligibilityCalculatedDate, 'long'),
                  },
                },
              ]
            : []),
          ...(topupSupervisionExpiryDate
            ? [
                {
                  key: {
                    text: 'Top-up supervision expiry date (TUSED)',
                  },
                  value: {
                    text: formatDate(topupSupervisionExpiryDate, 'long'),
                  },
                },
              ]
            : []),
          ...(earlyTransferDate
            ? [
                {
                  key: {
                    text: 'Early-transfer date (ETD)',
                  },
                  value: {
                    text: formatDate(earlyTransferDate, 'long'),
                  },
                },
              ]
            : []),
          ...(midTransferDate
            ? [
                {
                  key: {
                    text: 'Mid-transfer date (MTD)',
                  },
                  value: {
                    text: formatDate(midTransferDate, 'long'),
                  },
                },
              ]
            : []),
          ...(lateTransferDate
            ? [
                {
                  key: {
                    text: 'Late-transfer date (LTD)',
                  },
                  value: {
                    text: formatDate(lateTransferDate, 'long'),
                  },
                },
              ]
            : []),
        ].sort((a, b) => (a.key.text < b.key.text ? -1 : 1)),
      }
    }
    return {
      dates: [],
    }
  }
}
