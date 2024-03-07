import { format, startOfToday } from 'date-fns'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import { formatCurrency } from '../utils/utils'
import { formatDate } from '../utils/dateHelpers'
import OffenderSentenceTerms, {
  FindConsecutiveSentence,
  Licence,
} from '../data/interfaces/prisonApi/OffenderSentenceTerms'
import { GroupedSentence } from '../interfaces/groupSentencesBySequence'
import OffenceHistoryDetail from '../data/interfaces/prisonApi/OffenceHistoryDetail'
import { Charge } from '../data/enums/chargeCodes'
import CourtCase, { CourtHearing } from '../data/interfaces/prisonApi/CourtCase'
import CourtDateResults from '../data/interfaces/prisonApi/CourtDateResults'
import { CourtCaseDataMappedUnsentenced } from '../interfaces/courtCaseDataMapped'
import SentenceSummary, {
  SentenceSummaryCourtCaseExtended,
  SentenceSummaryCourtSentence,
  SentenceSummaryTermDetail,
} from '../data/interfaces/prisonApi/SentenceSummary'
import { RestClientBuilder } from '../data'
import { ReleaseDates } from '../interfaces/releaseDates'
import PrisonerSentenceDetails from '../data/interfaces/prisonApi/PrisonerSentenceDetails'

export default class OffencesPageService {
  constructor(private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>) {}

  public async get(token: string, prisonerData: Prisoner) {
    const { prisonerNumber, bookingId } = prisonerData
    const [courtCaseData, releaseDates] = await Promise.all([
      this.getCourtCasesData(token, bookingId, prisonerNumber),
      this.getReleaseDates(token, prisonerNumber),
    ])

    return {
      courtCaseData,
      releaseDates,
    }
  }

  getLengthTextLabels(data: Licence | OffenderSentenceTerms | SentenceSummaryTermDetail) {
    if (!data) return null

    if (
      'lifeSentence' in data &&
      data.lifeSentence === true &&
      !(data.years || data.months || data.weeks || data.days)
    ) {
      return 'Not entered'
    }

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

  getSentencedCaseIds(offenceHistory: OffenceHistoryDetail[], sentenceSummary: SentenceSummary) {
    const caseIdsFromOffenceHistory = this.chargeCodesFilter(offenceHistory)
    const caseIdsFromSentenceSummary = sentenceSummary.latestPrisonTerm.courtSentences.map(s => s.id)
    return [...new Set([...caseIdsFromOffenceHistory, ...caseIdsFromSentenceSummary])]
  }

  async getCourtCasesData(token: string, bookingId: number, prisonerNumber: string) {
    const prisonApiClient = this.prisonApiClientBuilder(token)
    const [courtCaseData, offenceHistory, sentenceTermsData, courtDateResults, sentenceSummary] = await Promise.all([
      prisonApiClient.getCourtCases(bookingId),
      prisonApiClient.getOffenceHistory(prisonerNumber),
      prisonApiClient.getSentenceTerms(bookingId),
      prisonApiClient.getCourtDateResults(prisonerNumber),
      prisonApiClient.getSentenceSummary(prisonerNumber),
    ])

    const caseIds = this.getSentencedCaseIds(offenceHistory, sentenceSummary)

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

  private getSedLedSled(sentenceDetails: PrisonerSentenceDetails['sentenceDetail']) {
    if (
      sentenceDetails.sentenceExpiryDate &&
      sentenceDetails.licenceExpiryDate &&
      sentenceDetails.sentenceExpiryDate === sentenceDetails.licenceExpiryDate
    )
      return { sentenceLicenceExpiryDate: sentenceDetails.sentenceExpiryDate }

    if (sentenceDetails.sentenceExpiryDate) return { sentenceExpiryDate: sentenceDetails.sentenceExpiryDate }
    if (sentenceDetails.licenceExpiryDate) return { licenceExpiryDate: sentenceDetails.licenceExpiryDate }
    return {}
  }

  private getNonDtoReleaseDate({
    nonDtoReleaseDate,
    nonDtoReleaseDateType,
    conditionalReleaseDate,
    automaticReleaseDate,
    nonParoleDate,
    postRecallReleaseDate,
  }: PrisonerSentenceDetails['sentenceDetail']) {
    const nonDtoReleaseDateTypeMap: Record<PrisonerSentenceDetails['sentenceDetail']['nonDtoReleaseDateType'], string> =
      {
        ARD: automaticReleaseDate,
        CRD: conditionalReleaseDate,
        NPD: nonParoleDate,
        PRRD: postRecallReleaseDate,
      }

    if (
      !nonDtoReleaseDate ||
      !nonDtoReleaseDateType ||
      nonDtoReleaseDateTypeMap[nonDtoReleaseDateType] === nonDtoReleaseDate
    )
      return {}

    if (nonDtoReleaseDateType === 'ARD') return { automaticReleaseDateNonDto: nonDtoReleaseDate }
    if (nonDtoReleaseDateType === 'CRD') return { conditionalReleaseNonDto: nonDtoReleaseDate }
    if (nonDtoReleaseDateType === 'NPD') return { nonParoleDateNonDto: nonDtoReleaseDate }
    if (nonDtoReleaseDateType === 'PRRD') return { postRecallDateNonDto: nonDtoReleaseDate }
    return {}
  }

  async getReleaseDates(token: string, prisonerNumber: string): Promise<Partial<ReleaseDates>> {
    const prisonApiClient = this.prisonApiClientBuilder(token)
    const releaseDates = await prisonApiClient.getPrisonerSentenceDetails(prisonerNumber)

    const sentenceDetails = releaseDates.sentenceDetail
    const dates = {
      actualParoleDate: sentenceDetails.actualParoleDate,
      confirmedReleaseDate: sentenceDetails.confirmedReleaseDate,
      automaticReleaseDate: sentenceDetails.automaticReleaseOverrideDate || sentenceDetails.automaticReleaseDate,
      conditionalRelease: sentenceDetails.conditionalReleaseOverrideDate || sentenceDetails.conditionalReleaseDate,
      detentionTrainingOrderPostRecallDate:
        sentenceDetails.dtoPostRecallReleaseDateOverride || sentenceDetails.dtoPostRecallReleaseDate,
      earlyRemovalSchemeEligibilityDate: sentenceDetails.earlyRemovalSchemeEligibilityDate,
      earlyTermDate: sentenceDetails.earlyTermDate,
      earlyTransferDate: sentenceDetails.etdOverrideDate || sentenceDetails.etdCalculatedDate,
      homeDetentionCurfewActualDate: sentenceDetails.homeDetentionCurfewActualDate,
      homeDetentionCurfewEligibilityDate: sentenceDetails.homeDetentionCurfewEligibilityDate,
      lateTermDate: sentenceDetails.lateTermDate,
      lateTransferDate: sentenceDetails.ltdOverrideDate || sentenceDetails.ltdCalculatedDate,
      midTermDate: sentenceDetails.midTermDate,
      midTransferDate: sentenceDetails.mtdOverrideDate || sentenceDetails.mtdCalculatedDate,
      nonParoleDate: sentenceDetails.nonParoleOverrideDate || sentenceDetails.nonParoleDate,
      paroleEligibilityCalculatedDate:
        sentenceDetails.paroleEligibilityOverrideDate || sentenceDetails.paroleEligibilityCalculatedDate,
      postRecallDate: sentenceDetails.postRecallReleaseOverrideDate || sentenceDetails.postRecallReleaseDate,
      releaseOnTemporaryLicenceDate: sentenceDetails.releaseOnTemporaryLicenceDate,
      tariffDate: sentenceDetails.tariffDate,
      tariffEarlyRemovalSchemeEligibilityDate: sentenceDetails.tariffEarlyRemovalSchemeEligibilityDate,
      topupSupervisionExpiryDate:
        sentenceDetails.topupSupervisionExpiryOverrideDate || sentenceDetails.topupSupervisionExpiryDate,
      ...this.getSedLedSled(sentenceDetails),
      ...this.getNonDtoReleaseDate(sentenceDetails),
    }
    return Object.keys(dates).reduce<Partial<ReleaseDates>>((dateObj, dateName) => {
      if (!dates[dateName]) return dateObj
      return {
        ...dateObj,
        [dateName]: dates[dateName],
      }
    }, {})
  }
}
