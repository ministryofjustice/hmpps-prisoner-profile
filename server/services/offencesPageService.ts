import { startOfToday } from 'date-fns'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import { formatCurrency } from '../utils/utils'
import { formatDate } from '../utils/dateHelpers'
import OffenderSentenceTerms, { Licence } from '../data/interfaces/prisonApi/OffenderSentenceTerms'
import GroupedSentence from './interfaces/offencesPageService/GroupSentencesBySequence'
import OffenceHistoryDetail from '../data/interfaces/prisonApi/OffenceHistoryDetail'
import { ChargeResultCode } from '../data/enums/chargeCodes'
import CourtCase from '../data/interfaces/prisonApi/CourtCase'
import CourtDateResults from '../data/interfaces/prisonApi/CourtDateResults'
import UnsentencedCourtCase from './interfaces/offencesPageService/UnsentencedCourtCase'
import SentenceSummary, {
  SentenceSummaryCourtSentence,
  SentenceSummaryTermDetail,
} from '../data/interfaces/prisonApi/SentenceSummary'
import { RestClientBuilder } from '../data'
import ReleaseDates from './interfaces/offencesPageService/ReleaseDates'
import PrisonerSentenceDetails from '../data/interfaces/prisonApi/PrisonerSentenceDetails'
import SentencedCourtCase from './interfaces/offencesPageService/SentencedCourtCase'

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
      const existing = result.find(groupedSentence => groupedSentence.key === key)

      if (existing) {
        return [
          { ...existing, items: [...existing.items, current] },
          ...result.filter((entry: GroupedSentence) => entry.key !== key),
        ]
      }
      return [{ key, caseId: current.caseId, items: [current], summaryListRows: [] }, ...result]
    }, [])
  }

  private getConcurrentConsecutive(
    sentenceTerms: OffenderSentenceTerms[],
    sentence: SentenceSummaryCourtSentence,
  ): 'Consecutive' | 'Concurrent' {
    const sentenceTerm = sentenceTerms.find(term => term.sentenceSequence === sentence.consecutiveToSequence)
    return sentenceTerm?.lineSeq ? 'Consecutive' : 'Concurrent'
  }

  getCaseIdsFilteredByResultCode(offenceHistory: OffenceHistoryDetail[]) {
    const requiredChargeCodes = Object.values(ChargeResultCode) as string[]
    return offenceHistory
      .filter(offence => requiredChargeCodes.includes(offence.primaryResultCode))
      .map(offence => offence.caseId)
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

    const sentencedCourtCases = this.mapSentenceSummaryCourtCases(
      courtCaseData,
      offenceHistory,
      sentenceSummary,
      sentenceTermsData,
    )

    const sentencedCourtCaseIds = sentencedCourtCases.map(sentenceSummaryCourtCase => sentenceSummaryCourtCase.id)

    const rawUnsentencedCourtCases = courtCaseData.filter(courtCase => !sentencedCourtCaseIds.includes(courtCase.id))
    const unsentencedCourtCases = this.mapUnsentencedCourtCases(rawUnsentencedCourtCases, courtDateResults)

    return [...sentencedCourtCases, ...unsentencedCourtCases]
  }

  getNextCourtAppearance(courtCase: CourtCase) {
    const today = startOfToday()
    const sortedHearings = courtCase.courtHearings
      ?.filter(hearing => hearing.dateTime && new Date(hearing.dateTime) >= today)
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())

    return sortedHearings[0]
  }

  getCourtName(courtCase: CourtCase) {
    if (courtCase.agency && courtCase.agency.description) {
      return courtCase.agency.description
    }
    if (courtCase.court && courtCase.court.description) {
      return courtCase.court.description
    }
    return undefined
  }

  getUniqueChargesFromCourtDateResults(courtDateResults: CourtDateResults[]) {
    return [...new Map(courtDateResults?.map(item => [item.charge.chargeId, item])).values()]
  }

  mapUnsentencedCourtCases(courtCaseData: CourtCase[], courtDateResults: CourtDateResults[]): UnsentencedCourtCase[] {
    return courtCaseData.map(courtCase => ({
      nextCourtAppearance: this.getNextCourtAppearance(courtCase),
      courtHearings: courtCase.courtHearings,
      courtName: this.getCourtName(courtCase),
      caseInfoNumber: courtCase.caseInfoNumber || 'Not entered',
      id: courtCase.id,
      sentenced: false,
      sentenceHeader: `Count ${courtCase.caseSeq}`,
      courtDateResults: this.getUniqueChargesFromCourtDateResults(courtDateResults)?.filter(
        courtDateResult => courtDateResult.charge.courtCaseId === courtCase.id,
      ),
    }))
  }

  mapSentenceSummaryCourtCases(
    courtCaseData: CourtCase[],
    offenceHistory: OffenceHistoryDetail[],
    sentenceSummary: SentenceSummary,
    sentenceTermsData: OffenderSentenceTerms[],
  ) {
    const caseIdsFromOffenceHistory = this.getCaseIdsFilteredByResultCode(offenceHistory)
    const caseIdsFromSentenceSummary = sentenceSummary.latestPrisonTerm.courtSentences.map(s => s.id)
    const sentencedCaseIds = [...new Set([...caseIdsFromOffenceHistory, ...caseIdsFromSentenceSummary])]

    const courtCasesFromSentenceSummary = this.getSentenceSummaryMapped(
      sentenceSummary,
      offenceHistory,
      courtCaseData,
      sentenceTermsData,
    )

    return courtCasesFromSentenceSummary.filter(courtCase => sentencedCaseIds.includes(courtCase.id))
  }

  getSentenceSummaryMapped(
    sentenceSummary: SentenceSummary,
    offenceHistory: OffenceHistoryDetail[],
    courtCaseData: CourtCase[],
    sentenceTermsData: OffenderSentenceTerms[],
  ): SentencedCourtCase[] {
    const sentencedCourtCases = sentenceSummary.latestPrisonTerm.courtSentences
    const groupedSentenceTerms = this.groupSentencesBySequence(sentenceTermsData)

    return sentencedCourtCases.map(courtSentence => {
      const mostRecentLicenceTerms = groupedSentenceTerms
        .filter(group => Number(group.caseId) === courtSentence.id)
        .map(groupedSentence => this.mergeMostRecentLicenceTerm(groupedSentence.items))

      return {
        ...courtSentence,
        courtHearings: courtCaseData.find(courtCase => courtCase.caseInfoNumber === courtSentence.caseInfoNumber)
          ?.courtHearings,
        sentences: courtSentence.sentences.map(sentence => {
          return {
            ...sentence,
            sentenceHeader: `Count ${sentence.lineSeq}`,
            sentenced: true,
            sentenceStartDate: formatDate(sentence.sentenceStartDate, 'long'),
            sentenceLength: sentence.terms ? this.getLengthTextLabels(sentence.terms[0]) : undefined,
            fineAmountFormat: sentence.fineAmount ? formatCurrency(sentence.fineAmount, 'GBP').toString() : undefined,
            sentenceLicence: this.getSentenceLicence(mostRecentLicenceTerms, courtSentence.id, sentence),
            concurrentConsecutive: this.getConcurrentConsecutive(sentenceTermsData, sentence),
            offences: sentence.offences.map(offence => {
              // find corresponding offence from offence history and take required fields
              const offenceHistoryDetail = offenceHistory.find(
                offenceFromHistory =>
                  offenceFromHistory.offenceDate === offence.offenceStartDate &&
                  offenceFromHistory.offenceCode === offence.offenceCode,
              )

              return {
                ...offence,
                offenceRangeDate: offenceHistoryDetail?.offenceRangeDate,
                offenceDate: offenceHistoryDetail?.offenceDate,
                statuteCode: offenceHistoryDetail?.statuteCode,
              }
            }),
          }
        }),
      }
    })
  }

  private getSentenceLicence(
    licenceTerms: SentenceSummaryTermDetail[],
    courtSentenceId: number,
    sentence: SentenceSummaryCourtSentence,
  ): string {
    const term = licenceTerms.find(
      licenceTerm =>
        licenceTerm.licence &&
        Number(licenceTerm.caseId) === courtSentenceId &&
        licenceTerm.sentenceTypeDescription === sentence.sentenceTypeDescription,
    )

    return term ? this.getLengthTextLabels(term.licence) : undefined
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
    const dates: Record<string, string> = {
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
