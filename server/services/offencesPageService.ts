import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { Prisoner } from '../interfaces/prisoner'
import moment from 'moment'
import { formatCurrency, formatDate, readableDateFormat, sortByEarliestDate } from '../utils/utils'
import { PrisonerSentenceDetails } from '../interfaces/prisonerSentenceDetails'
import { CourtHearing } from '../interfaces/prisonApi/courtHearing'
import { format, startOfToday, sub } from 'date-fns'

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

    console.log(courtCaseData[0].courtHearings)

    return {
      courtCaseData,
      releaseDates,
      courtCasesSentenceDetailsId,
    }
  }

  private async getCourtCasesData(bookingId: number, prisonerNumber: string) {
    const onlyValidValues = (value: any) => Boolean(value)

    const getLengthTextLabels = (data: any) => {
      const { years, months, weeks, days } = data

      const yearsLabel = years > 0 && `${years} ${years === 1 ? 'year' : 'years'}`
      const monthsLabel = months > 0 && `${months} ${months === 1 ? 'month' : 'months'}`
      const weeksLabel = weeks > 0 && `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`
      const daysLabel = days > 0 && `${days} ${days === 1 ? 'day' : 'days'}`

      return [yearsLabel, monthsLabel, weeksLabel, daysLabel].filter(label => label).join(', ')
    }

    const mergeMostRecentLicenceTerm = (sentences: any) =>
      sentences.reduce((result: any, current: any) => {
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

    const groupSentencesBySequence = (sentences: any) =>
      sentences.reduce((result: any, current: any) => {
        const key = current.lineSeq
        const existing = result.find((sentence: any) => sentence.key === key)

        if (existing) {
          return [
            { ...existing, items: [...existing.items, current] },
            ...result.filter((entry: any) => entry.key !== key),
          ]
        }
        return [{ key, caseId: current.caseId, items: [current] }, ...result]
      }, [])

    const sortBySentenceDateThenByImprisonmentLength = (left: any, right: any) => {
      const startDateLeft = moment(left.sentenceStartDate, 'YYYY-MM-DD')
      const startDateRight = moment(right.sentenceStartDate, 'YYYY-MM-DD')

      if (startDateLeft.isAfter(startDateRight)) return 1
      if (startDateLeft.isBefore(startDateRight)) return -1

      if (left.years < right.years) return 1
      if (left.years > right.years) return -1

      if (left.months < right.months) return 1
      if (left.months > right.months) return -1

      if (left.weeks < right.weeks) return 1
      if (left.weeks > right.weeks) return -1

      return right.days - left.days
    }

    const findConsecutiveSentence = ({ sentences, consecutiveTo }: any) => {
      const sentence: any = sentences.find((s: any) => s.sentenceSequence === consecutiveTo)
      return sentence && sentence.lineSeq
    }

    const [courtCaseData, offenceHistory, sentenceTermsData] = await Promise.all([
      this.prisonApiClient.getCourtCases(bookingId),
      this.prisonApiClient.getOffenceHistory(prisonerNumber),
      this.prisonApiClient.getSentenceTerms(bookingId),
    ])

    console.log(courtCaseData[0].courtHearings)

    const caseIds = [
      // Only show charge codes of Imprisonment (1002 & 1510), Recall (1501) and YOI (1024)
      ...new Set(
        offenceHistory
          .filter(offence =>
            ['1002', '1501', '1510', '1024', '3045', '1046', '1081', '1003', '2003'].includes(
              offence.primaryResultCode,
            ),
          )
          .map(offence => offence.caseId),
      ),
    ]

    const todaysDate = format(startOfToday(), 'yyyy-MM-dd')

    return courtCaseData
      .filter(courtCase => caseIds.includes(courtCase.id))
      .map(courtCase => ({
        courtHearings: courtCase.courtHearings
          .sort(sortByEarliestDate)
          .filter(
            (courtHearing: CourtHearing, index: number) =>
              index === courtCase.courtHearings.length - 1 && courtCase.courtHearings[index].dateTime > todaysDate,
          ),
        caseInfoNumber: courtCase.caseInfoNumber || 'Not entered',
        courtName: courtCase.agency && courtCase.agency.description,
        sentenceTerms: groupSentencesBySequence(sentenceTermsData)
          .filter((group: any) => Number(group.caseId) === courtCase.id)
          .map((groupedSentence: any) => mergeMostRecentLicenceTerm(groupedSentence.items))
          .sort(sortBySentenceDateThenByImprisonmentLength)
          .map((sentence: any) => ({
            sentenceHeader: `Sentence ${sentence.lineSeq}`,
            sentenceTypeDescription: sentence.sentenceTypeDescription,
            summaryDetailRows: [
              {
                label: 'Start date',
                value: formatDate(sentence.sentenceStartDate && sentence.sentenceStartDate, 'long'),
              },
              {
                label: 'Imprisonment',
                value: getLengthTextLabels(sentence),
              },
              sentence.consecutiveTo && {
                label: 'Consecutive to',
                value: findConsecutiveSentence({ sentences: sentenceTermsData, consecutiveTo: sentence.consecutiveTo }),
              },
              // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
              sentence.fineAmount && { label: 'Fine', value: formatCurrency(sentence.fineAmount) },
              sentence.licence && {
                label: 'Licence',
                value: getLengthTextLabels(sentence.licence),
              },
            ].filter(onlyValidValues),
          })),
        offences: [
          ...new Set(
            offenceHistory
              .filter(offence => offence.caseId === courtCase.id)
              .map(offence => offence.offenceDescription)
              .filter(onlyValidValues)
              .sort((left, right) => left.localeCompare(right)),
          ),
        ],
      }))
      .filter(courtCase => courtCase.sentenceTerms.length)
      .map(courtCase => {
        const sentenceDateRow = courtCase.sentenceTerms[0].summaryDetailRows.find(
          (st: any) => st.label === 'Start date',
        )

        return {
          ...courtCase,
          sentenceDate: formatDate(sentenceDateRow && sentenceDateRow.value, 'long'),
        }
      })
  }

  private async getReleaseDates(prisonerNumber: string) {
    const releaseDates: PrisonerSentenceDetails = await this.prisonApiClient.getPrisonerSentenceDetails(prisonerNumber)

    const sentenceDetails = releaseDates.sentenceDetail

    const conditionalRelease: string =
      sentenceDetails.conditionalReleaseOverrideDate || sentenceDetails.conditionalReleaseDate
    const postRecallDate = sentenceDetails.postRecallReleaseOverrideDate || sentenceDetails.postRecallReleaseDate
    const automaticReleaseDate = sentenceDetails.automaticReleaseOverrideDate || sentenceDetails.automaticReleaseDate
    const nonParoleDate = sentenceDetails.nonParoleOverrideDate || sentenceDetails.nonParoleDate
    const detentionTrainingOrderPostRecallDate =
      sentenceDetails.dtoPostRecallReleaseDateOverride || sentenceDetails.dtoPostRecallReleaseDate

    // return {dates:[]}
    return {
      dates: [
        ...(sentenceDetails.homeDetentionCurfewActualDate
          ? [
              {
                key: {
                  text: 'Approved for home detention curfew',
                },
                value: {
                  text: readableDateFormat(sentenceDetails.homeDetentionCurfewActualDate, 'YYYY-MM-DD'),
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
                  text: readableDateFormat(conditionalRelease, 'YYYY-MM-DD'),
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
                  text: readableDateFormat(postRecallDate, 'YYYY-MM-DD'),
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
                  text: readableDateFormat(sentenceDetails.midTermDate, 'YYYY-MM-DD'),
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
                  text: readableDateFormat(automaticReleaseDate, 'YYYY-MM-DD'),
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
                  text: readableDateFormat(nonParoleDate, 'YYYY-MM-DD'),
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
                  text: readableDateFormat(detentionTrainingOrderPostRecallDate, 'YYYY-MM-DD'),
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
                  text: readableDateFormat(sentenceDetails.paroleEligibilityDate, 'YYYY-MM-DD'),
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
                  text: readableDateFormat(sentenceDetails.homeDetentionCurfewEligibilityDate, 'YYYY-MM-DD'),
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
                  text: readableDateFormat(sentenceDetails.releaseOnTemporaryLicenceDate, 'YYYY-MM-DD'),
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
                  text: readableDateFormat(sentenceDetails.earlyRemovalSchemeEligibilityDate, 'YYYY-MM-DD'),
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
                  text: readableDateFormat(sentenceDetails.tariffEarlyRemovalSchemeEligibilityDate, 'YYYY-MM-DD'),
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
                  text: readableDateFormat(sentenceDetails.actualParoleDate, 'YYYY-MM-DD'),
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
                  text: readableDateFormat(sentenceDetails.earlyTermDate, 'YYYY-MM-DD'),
                },
              },
            ]
          : []),
        ...(sentenceDetails.licenceExpiryDate
          ? [
              {
                key: {
                  text: 'Licence expiry',
                },
                value: {
                  text: readableDateFormat(sentenceDetails.licenceExpiryDate, 'YYYY-MM-DD'),
                },
              },
            ]
          : []),
        ...(sentenceDetails.sentenceExpiryDate
          ? [
              {
                key: {
                  text: 'Sentence expiry',
                },
                value: {
                  text: readableDateFormat(sentenceDetails.sentenceExpiryDate, 'YYYY-MM-DD'),
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
                  text: readableDateFormat(sentenceDetails.topupSupervisionExpiryDate, 'YYYY-MM-DD'),
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
                  text: readableDateFormat(sentenceDetails.lateTermDate, 'YYYY-MM-DD'),
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
                  text: readableDateFormat(sentenceDetails.tariffDate, 'YYYY-MM-DD'),
                },
              },
            ]
          : []),
      ].sort(sortByEarliestDate),
    }
  }
}
