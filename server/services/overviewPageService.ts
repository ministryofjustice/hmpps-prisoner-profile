import { MiniSummary, MiniSummaryData } from '../interfaces/miniSummary'
import {
  OverviewNonAssociation,
  OverviewPage,
  OverviewSchedule,
  OverviewScheduleItem,
} from '../interfaces/overviewPage'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import {
  convertToTitleCase,
  formatDate,
  formatMoney,
  formatPrivilegedVisitsSummary,
  getNamesFromString,
} from '../utils/utils'
import { Assessment } from '../interfaces/prisonApi/assessment'
import { AssessmentCode } from '../data/enums/assessmentCode'
import { Incentive, Prisoner } from '../interfaces/prisoner'
import { PersonalDetails } from '../interfaces/personalDetails'
import { StaffContacts } from '../interfaces/staffContacts'
import AllocationManagerClient from '../data/interfaces/allocationManagerClient'
import KeyWorkerClient from '../data/interfaces/keyWorkerClient'
import { Pom } from '../interfaces/pom'
import { ScheduledEvent } from '../interfaces/scheduledEvent'
import groupEventsByPeriod from '../utils/groupEventsByPeriod'
import { Status } from '../interfaces/status'
import { getProfileInformationValue, ProfileInformationType } from '../interfaces/prisonApi/profileInformation'
import { ProblemType } from '../data/enums/problemType'
import { ProblemStatus } from '../data/enums/problemStatus'
import { pregnantProblemCodes } from '../data/constants'
import { BooleanString } from '../data/enums/booleanString'
import { pluralise } from '../utils/pluralise'

export default class OverviewPageService {
  private prisonApiClient: PrisonApiClient

  private allocationManagerClient: AllocationManagerClient

  private keyWorkerClient: KeyWorkerClient

  constructor(
    prisonApiClient: PrisonApiClient,
    allocationManagerClient: AllocationManagerClient,
    keyWorkerClient: KeyWorkerClient,
  ) {
    this.prisonApiClient = prisonApiClient
    this.allocationManagerClient = allocationManagerClient
    this.keyWorkerClient = keyWorkerClient
  }

  public async get(prisonerData: Prisoner): Promise<OverviewPage> {
    const { bookingId, currentIncentive, prisonerNumber } = prisonerData

    const nonAssociations = await this.getNonAssociations(prisonerNumber)
    const miniSummaryGroupA = await this.getMiniSummaryGroupA(prisonerNumber, bookingId)
    const miniSummaryGroupB = await this.getMiniSummaryGroupB(currentIncentive, bookingId)
    const personalDetails = this.getPersonalDetails(prisonerData)
    const staffContacts = await this.getStaffContacts(prisonerData)
    const schedule = await this.getSchedule(prisonerData.bookingId)
    const statuses = await this.getStatuses(prisonerData)

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

  public async getStaffContacts(prisonerData: Prisoner): Promise<StaffContacts> {
    const { bookingId } = prisonerData
    const [offenderContacts, allocationManager, offenderKeyWorker, keyWorkerSessions] = await Promise.all([
      this.prisonApiClient.getOffenderContacts(prisonerData.bookingId),
      this.allocationManagerClient.getPomByOffenderNo(prisonerData.prisonerNumber),
      this.keyWorkerClient.getOffendersKeyWorker(prisonerData.prisonerNumber),
      this.prisonApiClient.getCaseNoteSummaryByTypes({ type: 'KA', subType: 'KS', numMonths: 38, bookingId }),
    ])

    const communityOffenderManager =
      offenderContacts && offenderContacts.otherContacts !== undefined
        ? offenderContacts.otherContacts
            .filter(contact => contact && contact.contactType === 'COM')
            .map(contact => ({
              firstName: contact ? contact?.firstName : undefined,
              lastName: contact ? contact?.lastName : undefined,
            }))
        : []

    const prisonOffenderManager =
      allocationManager &&
      (allocationManager as Pom).primary_pom &&
      (allocationManager as Pom).primary_pom.name &&
      getNamesFromString((allocationManager as Pom).primary_pom.name)

    const coworkingPrisonOffenderManager =
      allocationManager &&
      (allocationManager as Pom).secondary_pom &&
      (allocationManager as Pom).secondary_pom.name &&
      getNamesFromString((allocationManager as Pom).secondary_pom.name)

    const staffContacts = {
      keyWorker: {
        name:
          offenderKeyWorker && offenderKeyWorker.firstName
            ? `${convertToTitleCase(offenderKeyWorker.firstName)} ${convertToTitleCase(offenderKeyWorker.lastName)}`
            : 'Not allocated',
        lastSession:
          keyWorkerSessions !== undefined && keyWorkerSessions[0] !== undefined
            ? formatDate(keyWorkerSessions[0].latestCaseNote, 'short')
            : '',
      },
      prisonOffenderManager:
        prisonOffenderManager !== undefined
          ? `${prisonOffenderManager[0]} ${prisonOffenderManager[1]}`
          : 'Not assigned',
      coworkingPrisonOffenderManager:
        coworkingPrisonOffenderManager !== undefined
          ? `${coworkingPrisonOffenderManager[0]} ${coworkingPrisonOffenderManager[1]}`
          : 'Not assigned',
      communityOffenderManager:
        communityOffenderManager && communityOffenderManager[0] !== undefined
          ? `${convertToTitleCase(communityOffenderManager[0].firstName)} ${convertToTitleCase(
              communityOffenderManager[0].lastName,
            )}`
          : 'Not assigned',
    }

    return staffContacts
  }

  public getPersonalDetails(prisonerData: Prisoner): PersonalDetails {
    const personalDetailsMain = [
      {
        key: {
          text: 'Preferred name',
        },
        value: {
          text: prisonerData.firstName ? `${convertToTitleCase(prisonerData.firstName)}` : 'None',
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
      bottomContentLine1: pluralise(adjudicationSummary.awards.length, 'active punishment', {
        emptyMessage: 'No active punishments',
      }),
      bottomContentLine1Href: adjudicationSummary.awards?.length ? '#' : undefined,
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
    const assessments = await this.prisonApiClient.getAssessments(bookingId)

    if (!Array.isArray(assessments)) {
      // TODO handle api call returning error???
      return null
    }

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

  private async getSchedule(bookingId: number): Promise<OverviewSchedule> {
    const formatEventForOverview = (event: ScheduledEvent): OverviewScheduleItem => {
      const name = event.eventSubType === 'PA' ? event.eventSourceDesc : event.eventSubTypeDesc
      const startTime = new Date(event.startTime)
      const endTime = new Date(event.endTime)
      const padWithZero = (num: number) => (num.toString().length === 1 ? `0${num}` : `${num}`)

      return {
        name,
        startTime: `${padWithZero(startTime.getHours())}:${padWithZero(startTime.getMinutes())}`,
        endTime: `${padWithZero(endTime.getHours())}:${padWithZero(endTime.getMinutes())}`,
      }
    }

    const scheduledEvents = await this.prisonApiClient.getEventsScheduledForToday(bookingId)
    const groupedEvents = groupEventsByPeriod(scheduledEvents)

    return {
      morning: groupedEvents.morningEvents.map(formatEventForOverview),
      afternoon: groupedEvents.afternoonEvents.map(formatEventForOverview),
      evening: groupedEvents.eveningEvents.map(formatEventForOverview),
    }
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

  private async getStatuses(prisonerData: Prisoner): Promise<Status[]> {
    const statusList: Status[] = []

    const [inmateDetail, personalCareNeeds] = await Promise.all([
      this.prisonApiClient.getInmateDetail(prisonerData.bookingId),
      this.prisonApiClient.getPersonalCareNeeds(prisonerData.bookingId, [ProblemType.MaternityStatus]),
    ])

    // Current Location
    const inOutStatusDescription = (status: string) =>
      ({
        IN: 'In',
        OUT: 'Out from',
        TRN: 'Transfer',
      }[status])

    const inOutLocationDescription = (status: string) =>
      ({
        IN: prisonerData.locationDescription,
        OUT: prisonerData.locationDescription,
        TRN: prisonerData.locationDescription,
      }[status])

    statusList.push({
      label: `${inOutStatusDescription(prisonerData.inOutStatus)} ${inOutLocationDescription(
        prisonerData.inOutStatus,
      )}`,
    })

    // Youth Offender TODO
    // if (prisonerData.youthOffender) {
    //   statusList.push({
    //     label: 'Youth offender',
    //     date: formatDate('2023-01-01', 'short'),
    //   })
    // }

    // Pregnant
    const pregnantNeed = personalCareNeeds?.personalCareNeeds?.find(
      need =>
        pregnantProblemCodes.includes(need.problemCode) &&
        !need.endDate &&
        need.problemStatus === ProblemStatus.Ongoing,
    )

    if (pregnantNeed) {
      statusList.push({
        label: 'Pregnant',
        date: formatDate(pregnantNeed.startDate, 'short'),
      })
    }

    // Listener - Recognised and Suitable
    const recognised = getProfileInformationValue(
      ProfileInformationType.RecognisedListener,
      inmateDetail.profileInformation,
    )
    const suitable = getProfileInformationValue(
      ProfileInformationType.SuitableListener,
      inmateDetail.profileInformation,
    )

    if (suitable === BooleanString.Yes && recognised !== BooleanString.Yes) {
      statusList.push({
        label: 'Suitable Listener',
      })
    }

    if ((recognised === BooleanString.Yes || recognised === BooleanString.No) && suitable !== BooleanString.No) {
      statusList.push({
        label: 'Recognised Listener',
      })
    }

    return statusList
  }
}
