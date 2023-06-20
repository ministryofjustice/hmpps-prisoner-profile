import { differenceInDays, format, isAfter, startOfToday } from 'date-fns'
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
  formatCategoryCodeDescription,
  formatMoney,
  formatPrivilegedVisitsSummary,
  getNamesFromString,
  prisonerBelongsToUsersCaseLoad,
  userHasRoles,
} from '../utils/utils'
import { Assessment } from '../interfaces/prisonApi/assessment'
import { AssessmentCode } from '../data/enums/assessmentCode'
import { Prisoner } from '../interfaces/prisoner'
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
import { formatDate, formatDateISO } from '../utils/dateHelpers'
import { IncentivesApiClient } from '../data/interfaces/incentivesApiClient'
import { CaseNoteSubType, CaseNoteType } from '../data/enums/caseNoteType'
import OffencesPageService from './offencesPageService'
import { CourtHearing } from '../interfaces/prisonApi/courtHearing'
import { CourtCase } from '../interfaces/prisonApi/courtCase'
import config from '../config'
import { Role } from '../data/enums/role'
import { CaseLoad } from '../interfaces/caseLoad'
import { formatScheduledEventTime } from '../utils/formatScheduledEventTime'
import { MainOffence } from '../interfaces/prisonApi/mainOffence'

export default class OverviewPageService {
  private prisonApiClient: PrisonApiClient

  private allocationManagerClient: AllocationManagerClient

  private keyWorkerClient: KeyWorkerClient

  private incentivesApiClient: IncentivesApiClient

  constructor(
    prisonApiClient: PrisonApiClient,
    allocationManagerClient: AllocationManagerClient,
    keyWorkerClient: KeyWorkerClient,
    incentivesApiClient: IncentivesApiClient,
  ) {
    this.prisonApiClient = prisonApiClient
    this.allocationManagerClient = allocationManagerClient
    this.keyWorkerClient = keyWorkerClient
    this.incentivesApiClient = incentivesApiClient
  }

  public async get(
    prisonerData: Prisoner,
    staffId: number,
    userCaseLoads: CaseLoad[] = [],
    userRoles: string[] = [],
  ): Promise<OverviewPage> {
    const { bookingId, prisonerNumber, imprisonmentStatusDescription, conditionalReleaseDate, confirmedReleaseDate } =
      prisonerData

    const [
      nonAssociations,
      miniSummaryGroupA,
      miniSummaryGroupB,
      personalDetails,
      staffContacts,
      schedule,
      statuses,
      offencesOverview,
      staffRoles,
    ] = await Promise.all([
      this.getNonAssociations(prisonerNumber),
      this.getMiniSummaryGroupA(prisonerData, userCaseLoads, userRoles),
      this.getMiniSummaryGroupB(prisonerData, userCaseLoads, userRoles),
      this.getPersonalDetails(prisonerData),
      this.getStaffContacts(prisonerData),
      this.getSchedule(prisonerData),
      this.getStatuses(prisonerData),
      this.getOffencesOverview(
        bookingId,
        prisonerNumber,
        imprisonmentStatusDescription,
        conditionalReleaseDate,
        confirmedReleaseDate,
      ),
      this.prisonApiClient.getStaffRoles(staffId, prisonerData.prisonId),
    ])

    return {
      miniSummaryGroupA,
      miniSummaryGroupB,
      statuses,
      nonAssociations,
      personalDetails,
      staffContacts,
      schedule,
      offencesOverview,
      prisonName: prisonerData.prisonName,
      staffRoles: staffRoles.map(role => role.role),
    }
  }

  public async getOffencesOverview(
    bookingId: number,
    prisonerNumber: string,
    imprisonmentStatusDescription: string,
    conditionalReleaseDate: string,
    confirmedReleaseDate: string,
  ) {
    const [mainOffence, courtCaseData, fullStatus] = await Promise.all([
      this.prisonApiClient.getMainOffence(bookingId),
      this.prisonApiClient.getCourtCases(bookingId),
      this.prisonApiClient.getFullStatus(prisonerNumber),
    ])

    const nextCourtAppearance = await this.getNextCourtAppearanceForOverview(courtCaseData)

    const mainOffenceDescription = await this.getMainOffenceDescription(mainOffence)
    return {
      mainOffenceDescription,
      courtCaseData,
      fullStatus,
      imprisonmentStatusDescription,
      conditionalReleaseDate,
      confirmedReleaseDate,
      nextCourtAppearance,
    }
  }

  async getMainOffenceDescription(mainOffence: MainOffence[]): Promise<string> {
    const desc = mainOffence[0] && mainOffence[0].offenceDescription ? mainOffence[0].offenceDescription : 'Not entered'
    return desc
  }

  async getNextCourtAppearanceForOverview(courtCaseData: CourtCase[]) {
    const offencesPageService = new OffencesPageService(this.prisonApiClient)
    const todaysDate = format(startOfToday(), 'yyyy-MM-dd')
    let nextCourtAppearance: CourtHearing = {} as CourtHearing
    if (Array.isArray(courtCaseData)) {
      await Promise.all(
        courtCaseData.map(async (courtCase: CourtCase) => {
          const courtAppearance = await offencesPageService.getNextCourtAppearance(courtCase, todaysDate)

          if (!nextCourtAppearance.dateTime && courtAppearance.dateTime) {
            nextCourtAppearance = courtAppearance
          } else if (courtAppearance.dateTime && nextCourtAppearance.dateTime) {
            const courtDate = format(new Date(courtAppearance.dateTime), 'yyyy-MM-dd')
            const currentNextDate = format(new Date(nextCourtAppearance.dateTime), 'yyyy-MM-dd')
            if (courtDate < currentNextDate) {
              nextCourtAppearance = courtAppearance
            }
          }
        }),
      )
    }
    return nextCourtAppearance
  }

  public async getStaffContacts(prisonerData: Prisoner): Promise<StaffContacts> {
    const { bookingId } = prisonerData
    const [offenderContacts, allocationManager, offenderKeyWorker, keyWorkerSessions] = await Promise.all([
      this.prisonApiClient.getBookingContacts(prisonerData.bookingId),
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
      linkUrl: `${config.serviceUrls.digitalPrison}/prisoner/${prisonerData.prisonerNumber}/professional-contacts`,
    }

    return staffContacts
  }

  public async getPersonalDetails(prisonerData: Prisoner): Promise<PersonalDetails> {
    const inmateDetail = await this.prisonApiClient.getInmateDetail(prisonerData.bookingId)

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
          text: inmateDetail.age ? inmateDetail.age.toString() : 'None',
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
          text: inmateDetail.language ? inmateDetail.language : 'No language entered',
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

  private async getMiniSummaryGroupA(
    prisonerData: Prisoner,
    userCaseLoads: CaseLoad[],
    userRoles: string[],
  ): Promise<MiniSummary[]> {
    const { prisonerNumber, bookingId, prisonId } = prisonerData
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
      bottomLabel: 'Private cash',
      bottomContentLine1: formatMoney(accountBalances.cash),
      bottomClass: 'big',
      linkLabel: 'Transactions and savings',
      linkHref: `${config.serviceUrls.digitalPrison}/prisoner/${prisonerNumber}/prisoner-finance-details/spends`,
    }

    const adjudicationsSummaryData: MiniSummaryData = {
      heading: 'Adjudications',
      topLabel: 'Proven in last 3 months',
      topContent: adjudicationSummary.adjudicationCount,
      topClass: 'big',
      bottomLabel: 'Active',
      bottomContentLine1: pluralise(adjudicationSummary.awards?.length, 'active punishment', {
        emptyMessage: 'No active punishments',
      }),
      bottomContentLine1Href: adjudicationSummary.awards?.length
        ? `/prisoner/${prisonerNumber}/active-punishments`
        : undefined,
      bottomClass: 'small',
      linkLabel: 'Adjudications history',
      linkHref: `${config.serviceUrls.digitalPrison}/prisoner/${prisonerNumber}/adjudications`,
    }

    const visitsSummaryData: MiniSummaryData = {
      heading: 'Visits',
      topLabel: 'Next visit date',
      topContent: visitSummary.startDateTime ? formatDate(visitSummary.startDateTime, 'short') : 'None scheduled',
      topClass: visitSummary.startDateTime ? 'big' : 'small',
      bottomLabel: 'Remaining visits',
      bottomContentLine1: visitBalances.remainingVo ? visitBalances.remainingVo : '0',
      bottomContentLine3: privilegedVisitsDescription,
      bottomClass: visitBalances.remainingVo ? 'small' : 'big',
      linkLabel: 'Visits details',
      linkHref: `${config.serviceUrls.digitalPrison}/prisoner/${prisonerNumber}/visits-details`,
    }

    const summaryData = []
    const belongsToCaseLoad = prisonerBelongsToUsersCaseLoad(prisonId, userCaseLoads)

    if (belongsToCaseLoad) {
      summaryData.push({ data: moneySummaryData, classes: 'govuk-grid-row card-body' })
    }

    if (belongsToCaseLoad || userHasRoles([Role.PomUser, Role.ReceptionUser], userRoles)) {
      summaryData.push({ data: adjudicationsSummaryData, classes: 'govuk-grid-row card-body' })
    }

    if (belongsToCaseLoad) {
      summaryData.push({ data: visitsSummaryData, classes: 'govuk-grid-row card-body' })
    }

    return summaryData
  }

  private async getMiniSummaryGroupB(
    prisonerData: Prisoner,
    userCaseLoads: CaseLoad[],
    userRoles: string[],
  ): Promise<MiniSummary[]> {
    const { prisonerNumber, bookingId, prisonId } = prisonerData

    const incentiveReviews = await this.incentivesApiClient.getReviews(bookingId)

    const [positiveBehaviourCount, negativeBehaviourCount] = await Promise.all([
      this.prisonApiClient.getCaseNoteCount(
        bookingId,
        CaseNoteType.PositiveBehaviour,
        CaseNoteSubType.IncentiveEncouragement,
        incentiveReviews.iepDate,
        formatDateISO(new Date()),
      ),
      this.prisonApiClient.getCaseNoteCount(
        bookingId,
        CaseNoteType.NegativeBehaviour,
        CaseNoteSubType.IncentiveWarning,
        incentiveReviews.iepDate,
        formatDateISO(new Date()),
      ),
    ])

    const category: Assessment =
      prisonerData.assessments?.find(
        (assessment: Assessment) => assessment.assessmentCode === AssessmentCode.category,
      ) || null
    const csra: Assessment =
      prisonerData.assessments?.find((assessment: Assessment) => assessment.assessmentCode === AssessmentCode.csra) ||
      null

    const belongsToCaseLoad = prisonerBelongsToUsersCaseLoad(prisonId, userCaseLoads)

    const categorySummaryData: MiniSummaryData = {
      bottomLabel: 'Category',
      bottomContentLine1: formatCategoryCodeDescription(category?.classificationCode),
      bottomContentLine3: category ? `Next review: ${formatDate(category.nextReviewDate, 'short')}` : '',
      bottomClass: 'small',
      linkLabel: undefined,
      linkHref: undefined,
    }

    if (belongsToCaseLoad) {
      categorySummaryData.linkLabel = userHasRoles(
        [
          Role.CreateRecategorisation,
          Role.ApproveCategorisation,
          Role.CreateRecategorisation,
          Role.CategorisationSecurity,
        ],
        userRoles,
      )
        ? 'Manage category'
        : 'View category'
      categorySummaryData.linkHref = `${config.serviceUrls.offenderCategorisation}/${bookingId}`
    }

    const incentiveSummaryData: MiniSummaryData = {
      bottomLabel: 'Incentives: since last review',
      bottomContentLine1: `Positive behaviours: ${positiveBehaviourCount.count}`,
      bottomContentLine2: `Negative behaviours: ${negativeBehaviourCount.count}`,
      bottomContentLine3: `Next review by: ${formatDate(incentiveReviews.nextReviewDate, 'short')}`,
      bottomContentError: isAfter(new Date(), new Date(incentiveReviews.nextReviewDate))
        ? `${pluralise(differenceInDays(new Date(), new Date(incentiveReviews.nextReviewDate)), 'day')} overdue`
        : undefined,
      bottomClass: 'small',
      linkLabel: 'Incentive level details',
      linkHref: `${config.serviceUrls.digitalPrison}/prisoner/${prisonerNumber}/incentive-level-details`,
    }

    const csraSummaryData: MiniSummaryData = {
      bottomLabel: 'CSRA',
      bottomContentLine1: csra ? csra.classification : 'Not entered',
      bottomContentLine3: csra ? `Last review: ${formatDate(csra.assessmentDate, 'short')}` : '',
      bottomClass: 'small',
      linkLabel: undefined,
      linkHref: undefined,
    }

    if (belongsToCaseLoad) {
      csraSummaryData.linkLabel = 'CSRA history'
      csraSummaryData.linkHref = `${config.serviceUrls.digitalPrison}/prisoner/${prisonerNumber}/csra-history`
    }

    const summaryData = []

    summaryData.push({ data: categorySummaryData, classes: 'govuk-grid-row card-body' })

    if (belongsToCaseLoad) {
      summaryData.push({ data: incentiveSummaryData, classes: 'govuk-grid-row card-body' })
    }

    summaryData.push({ data: csraSummaryData, classes: 'govuk-grid-row card-body' })

    return summaryData
  }

  private async getSchedule(prisonerData: Prisoner): Promise<OverviewSchedule> {
    const formatEventForOverview = (event: ScheduledEvent): OverviewScheduleItem => {
      const name = event.eventSubType === 'PA' ? event.eventSourceDesc : event.eventSubTypeDesc
      const { startTime, endTime } = formatScheduledEventTime(event)

      return {
        name,
        startTime,
        endTime,
      }
    }

    const scheduledEvents = await this.prisonApiClient.getEventsScheduledForToday(prisonerData.bookingId)
    const groupedEvents = groupEventsByPeriod(scheduledEvents)

    return {
      morning: groupedEvents.morningEvents.map(formatEventForOverview),
      afternoon: groupedEvents.afternoonEvents.map(formatEventForOverview),
      evening: groupedEvents.eveningEvents.map(formatEventForOverview),
      linkUrl: `${config.serviceUrls.digitalPrison}/prisoner/${prisonerData.prisonerNumber}/schedule`,
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
          {
            html: `<a class="govuk-link govuk-link--no-visited-state" href="/prisoner/${offenderNonAssociation.offenderNo}">${nonAssociationName}</a>`,
          },
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
    let currentLocation = ''
    if (prisonerData.inOutStatus === 'IN') {
      currentLocation = `In ${prisonerData.prisonName}`
    } else if (prisonerData.status === 'ACTIVE OUT') {
      currentLocation = `Out from ${prisonerData.prisonName}`
    } else if (prisonerData.status === 'INACTIVE OUT') {
      currentLocation = prisonerData.locationDescription
    } else if (prisonerData.inOutStatus === 'TRN') {
      currentLocation = 'Being transferred'
    }

    statusList.push({
      label: currentLocation,
    })

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
