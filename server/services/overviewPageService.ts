import { schedule, staffContacts, statuses } from '../data/overviewPage'
import { MiniSummary, MiniSummaryData } from '../interfaces/miniSummary'
import { OverviewNonAssociation, OverviewPage } from '../interfaces/overviewPage'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { formatDate, formatMoney, formatPrivilegedVisitsSummary } from '../utils/utils'
import { Assessment } from '../interfaces/assessment'
import { AssessmentCode } from '../data/enums/assessmentCode'
import { Incentive, Prisoner } from '../interfaces/prisoner'
import { PersonalDetails } from '../interfaces/personalDetails'

export default class OverviewPageService {
  private prisonApiClient: PrisonApiClient

  constructor(prisonApiClient: PrisonApiClient) {
    this.prisonApiClient = prisonApiClient
  }

  public async get(prisonerData: Prisoner): Promise<OverviewPage> {
    const { bookingId, currentIncentive, prisonerNumber } = prisonerData

    const nonAssociations = await this.getNonAssociations(prisonerNumber)
    const miniSummaryGroupA = await this.getMiniSummaryGroupA(prisonerNumber, bookingId)
    const miniSummaryGroupB = await this.getMiniSummaryGroupB(currentIncentive, bookingId)
    const personalDetails = this.getPersonalDetails(prisonerData)

    return {
      miniSummaryGroupA,
      miniSummaryGroupB,
      statuses,
      nonAssociations,
      personalDetails,
      staffContacts,
      schedule,
    }
  }

  private getPersonalDetails(prisonerData: Prisoner): PersonalDetails {
    const personalDetailsMain = [
      {
        key: {
          text: 'Preferred name',
        },
        value: {
          text:
            prisonerData.firstName || prisonerData.lastName
              ? `${prisonerData.firstName} ${prisonerData.lastName}`
              : 'None',
        },
      },
      {
        key: {
          text: 'Date of birth',
        },
        value: {
          text: prisonerData.dateOfBirth ? formatDate(prisonerData.dateOfBirth, 'short') : 'None',
        },
      },
      {
        key: {
          text: 'Age',
        },
        value: {
          text: prisonerData.dateOfBirth ? formatDate(prisonerData.dateOfBirth, 'short') : 'None',
        },
      },
      {
        key: {
          text: 'Nationality',
        },
        value: {
          text: prisonerData.nationality ? prisonerData.nationality : 'None',
        },
      },
      {
        key: {
          text: 'Spoken language',
        },
        value: {
          text: prisonerData.language ? prisonerData.language : 'No language entered',
        },
      },
    ]

    const personalDetailsSide = [
      {
        key: {
          text: 'CRO number',
        },
        value: {
          text: prisonerData.croNumber ? prisonerData.croNumber : 'None',
        },
      },
      {
        key: {
          text: 'PNC number',
        },
        value: {
          text: prisonerData.pncNumber ? prisonerData.pncNumber : 'None',
        },
      },
    ]

    return { personalDetailsMain, personalDetailsSide }
  }

  private async getMiniSummaryGroupA(prisonerNumber: string, bookingId: number): Promise<MiniSummary[]> {
    const [accountBalances, adjudicationSummary, visitSummary, visitBalances] = await Promise.all([
      this.prisonApiClient.getAccountBalances(bookingId),
      this.prisonApiClient.getAdjudications(bookingId),
      this.prisonApiClient.getVisitSummary(bookingId),
      this.prisonApiClient.getVisitBalances(prisonerNumber),
    ])

    let privilegedVisitsDescription = ''
    if (visitBalances.remainingPvo) {
      privilegedVisitsDescription = formatPrivilegedVisitsSummary(visitBalances.remainingPvo)
    } else if (visitBalances.remainingVo) {
      privilegedVisitsDescription = 'No privileged visits'
    }

    const moneySummaryData: MiniSummaryData = {
      heading: 'Money',
      topLabel: 'Spends',
      topContent: formatMoney(accountBalances.spends),
      topClass: 'big',
      bottomLabel: 'Private Cash',
      bottomContentLine1: formatMoney(accountBalances.cash),
      bottomClass: 'big',
      linkLabel: 'Transactions and savings',
      linkHref: '#',
    }

    const adjudicationsSummaryData: MiniSummaryData = {
      heading: 'Adjudications',
      topLabel: 'Proven in last 3 months',
      topContent: adjudicationSummary.adjudicationCount,
      topClass: 'big',
      bottomLabel: 'Active',
      bottomContentLine1: adjudicationSummary.awards?.length
        ? `${adjudicationSummary.awards.length} active punishments`
        : 'No active awards',
      bottomClass: 'small',
      linkLabel: 'Adjudications history',
      linkHref: '#',
    }

    const visitsSummaryData: MiniSummaryData = {
      heading: 'Visits',
      topLabel: 'Next visit date',
      topContent: visitSummary.startDateTime ? formatDate(visitSummary.startDateTime, 'short') : 'None scheduled',
      topClass: visitSummary.startDateTime ? 'big' : 'small',
      bottomLabel: 'Remaining visits',
      bottomContentLine1: visitBalances.remainingVo ? visitBalances.remainingVo : '0',
      bottomContentLine2: privilegedVisitsDescription,
      bottomClass: visitBalances.remainingVo ? 'small' : 'big',
      linkLabel: 'Visits details',
      linkHref: '#',
    }

    return [
      {
        data: moneySummaryData,
        classes: 'govuk-grid-row card-body',
      },
      {
        data: adjudicationsSummaryData,
        classes: 'govuk-grid-row card-body',
      },
      {
        data: visitsSummaryData,
        classes: 'govuk-grid-row card-body',
      },
    ]
  }

  private async getMiniSummaryGroupB(currentIncentive: Incentive, bookingId: number): Promise<MiniSummary[]> {
    const [assessments] = await Promise.all([this.prisonApiClient.getAssessments(bookingId)])

    const category: Assessment =
      assessments?.find((assessment: Assessment) => assessment.assessmentCode === AssessmentCode.category) || null
    const csra: Assessment =
      assessments?.find((assessment: Assessment) => assessment.assessmentCode === AssessmentCode.csra) || null

    const categorySummaryData: MiniSummaryData = {
      bottomLabel: 'Category',
      bottomContentLine1: category ? category.classificationCode : 'Not entered',
      bottomContentLine2: category ? `Next review: ${formatDate(category.nextReviewDate, 'short')}` : '',
      bottomClass: 'small',
      linkLabel: 'Manage category',
      linkHref: '#',
    }

    const incentiveSummaryData: MiniSummaryData = {
      bottomLabel: 'Incentive level',
      bottomContentLine1: currentIncentive ? currentIncentive.level.description : 'Not entered',
      bottomContentLine2: currentIncentive
        ? `Next review: ${formatDate(currentIncentive.nextReviewDate, 'short')}`
        : '',
      bottomClass: 'small',
      linkLabel: 'Incentive level details',
      linkHref: '#',
    }

    const csraSummaryData: MiniSummaryData = {
      bottomLabel: 'CSRA',
      bottomContentLine1: csra ? csra.classification : 'Not entered',
      bottomContentLine2: csra ? `Last review: ${formatDate(csra.assessmentDate, 'short')}` : '',
      bottomClass: 'small',
      linkLabel: 'CSRA history',
      linkHref: '#',
    }

    return [
      {
        data: categorySummaryData,
        classes: 'govuk-grid-row card-body',
      },
      {
        data: incentiveSummaryData,
        classes: 'govuk-grid-row card-body',
      },
      {
        data: csraSummaryData,
        classes: 'govuk-grid-row card-body',
      },
    ]
  }

  private async getNonAssociations(prisonerNumber: string): Promise<OverviewNonAssociation[]> {
    const nonAssociations = await this.prisonApiClient.getNonAssociationDetails(prisonerNumber)
    if (!nonAssociations?.nonAssociations) return []

    return nonAssociations.nonAssociations
      .filter(nonassociation => {
        return nonassociation.offenderNonAssociation.agencyDescription === nonAssociations.agencyDescription
      })
      .map(nonAssocation => {
        const { offenderNonAssociation } = nonAssocation
        const nonAssociationName = `${offenderNonAssociation.firstName} ${offenderNonAssociation.lastName}`
        return [
          { text: nonAssociationName },
          { text: offenderNonAssociation.offenderNo },
          { text: offenderNonAssociation.assignedLivingUnitDescription },
          { text: offenderNonAssociation.reasonDescription },
        ]
      })
  }
}
