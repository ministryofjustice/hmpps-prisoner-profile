import { differenceInDays, format, isAfter, startOfToday } from 'date-fns'
import { MiniSummary, MiniSummaryData } from '../interfaces/miniSummary'
import {
  AlertsSummary,
  OverviewNonAssociation,
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
  nonAssociationsEnabled,
  prisonerBelongsToUsersCaseLoad,
  userCanEdit,
  userHasRoles,
} from '../utils/utils'
import { Assessment } from '../interfaces/prisonApi/assessment'
import { AssessmentCode } from '../data/enums/assessmentCode'
import { Prisoner } from '../interfaces/prisoner'
import { PersonalDetails } from '../interfaces/personalDetails'
import { ContactDetail, StaffContacts } from '../interfaces/staffContacts'
import AllocationManagerClient from '../data/interfaces/allocationManagerClient'
import KeyWorkerClient from '../data/interfaces/keyWorkerClient'
import { Pom } from '../interfaces/pom'
import { ScheduledEvent } from '../interfaces/scheduledEvent'
import groupEventsByPeriod from '../utils/groupEventsByPeriod'
import { Status } from '../interfaces/status'
import { getProfileInformationValue, ProfileInformationType } from '../interfaces/prisonApi/profileInformation'
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
import { RestClientBuilder } from '../data'
import { AdjudicationsApiClient } from '../data/interfaces/adjudicationsApiClient'
import { CuriousApiClient } from '../data/interfaces/curiousApiClient'
import { InmateDetail } from '../interfaces/prisonApi/inmateDetail'
import { NonAssociationsApiClient } from '../data/interfaces/nonAssociationsApiClient'
import { MovementType } from '../data/enums/movementType'
import { LearnerNeurodivergence } from '../interfaces/learnerNeurodivergence'
import { Movement } from '../interfaces/prisonApi/movement'
import { NonAssociationDetails } from '../interfaces/nonAssociationDetails'
import { KeyWorker } from '../interfaces/keyWorker'
import { CaseNote } from '../interfaces/caseNote'
import { FullStatus } from '../interfaces/prisonApi/fullStatus'
import { OverviewViewModel } from '../controllers/overviewController'
import { PathfinderApiClient } from '../data/interfaces/pathfinderApiClient'
import { ManageSocCasesApiClient } from '../data/interfaces/manageSocCasesApiClient'
import { Nominal } from '../interfaces/pathfinderApi/nominal'
import { User } from '../data/hmppsAuthClient'
import { HmppsAction } from '../interfaces/hmppsAction'
import { canAddCaseNotes, canViewCalculateReleaseDates, canViewCaseNotes } from '../utils/roleHelpers'
import { Icon } from '../data/enums/icon'
import { mapHeaderData } from '../mappers/headerMappers'

export default class OverviewPageService {
  private prisonApiClient: PrisonApiClient

  private allocationManagerClient: AllocationManagerClient

  private keyWorkerClient: KeyWorkerClient

  private incentivesApiClient: IncentivesApiClient

  private adjudicationsApiClient: AdjudicationsApiClient

  private curiousApiClient: CuriousApiClient

  private nonAssociationsApiClient: NonAssociationsApiClient

  private pathfinderApiClient: PathfinderApiClient

  private manageSocCasesApiClient: ManageSocCasesApiClient

  constructor(
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly allocationManagerApiClientBuilder: RestClientBuilder<AllocationManagerClient>,
    private readonly keyworkerApiClientBuilder: RestClientBuilder<KeyWorkerClient>,
    private readonly incentivesApiClientBuilder: RestClientBuilder<IncentivesApiClient>,
    private readonly adjudicationsApiClientBuilder: RestClientBuilder<AdjudicationsApiClient>,
    private readonly offencesPageService: OffencesPageService,
    private readonly curiousApiClientBuilder: RestClientBuilder<CuriousApiClient>,
    private readonly nonAssociationsApiClientBuilder: RestClientBuilder<NonAssociationsApiClient>,
    private readonly pathfinderClientBuilder: RestClientBuilder<PathfinderApiClient>,
    private readonly manageSocCasesApiClientBuilder: RestClientBuilder<ManageSocCasesApiClient>,
  ) {}

  public async get(clientToken: string, prisonerData: Prisoner, user: User): Promise<OverviewViewModel> {
    const { staffId, caseLoads, userRoles } = user
    const { bookingId, prisonerNumber, imprisonmentStatusDescription, conditionalReleaseDate, confirmedReleaseDate } =
      prisonerData

    this.prisonApiClient = this.prisonApiClientBuilder(clientToken)
    this.allocationManagerClient = this.allocationManagerApiClientBuilder(clientToken)
    this.keyWorkerClient = this.keyworkerApiClientBuilder(clientToken)
    this.incentivesApiClient = this.incentivesApiClientBuilder(clientToken)
    this.adjudicationsApiClient = this.adjudicationsApiClientBuilder(clientToken)
    this.curiousApiClient = this.curiousApiClientBuilder(clientToken)
    this.nonAssociationsApiClient = this.nonAssociationsApiClientBuilder(clientToken)
    this.pathfinderApiClient = this.pathfinderClientBuilder(clientToken)
    this.manageSocCasesApiClient = this.manageSocCasesApiClientBuilder(clientToken)

    const [
      inmateDetail,
      staffRoles,
      learnerNeurodivergence,
      movements,
      nonAssociationDetails,
      offenderContacts,
      allocationManager,
      offenderKeyWorker,
      keyWorkerSessions,
      mainOffence,
      courtCaseData,
      fullStatus,
      pathfinderNominal,
      socNominal,
    ] = await Promise.all([
      this.prisonApiClient.getInmateDetail(prisonerData.bookingId),
      this.prisonApiClient.getStaffRoles(staffId, prisonerData.prisonId),
      this.curiousApiClient.getLearnerNeurodivergence(prisonerData.prisonerNumber),
      this.prisonApiClient.getMovements([prisonerData.prisonerNumber], [MovementType.Transfer]),
      this.nonAssociationsApiClient.getNonAssociationDetails(prisonerNumber),
      this.prisonApiClient.getBookingContacts(prisonerData.bookingId),
      this.allocationManagerClient.getPomByOffenderNo(prisonerData.prisonerNumber),
      this.keyWorkerClient.getOffendersKeyWorker(prisonerData.prisonerNumber),
      this.prisonApiClient.getCaseNoteSummaryByTypes({ type: 'KA', subType: 'KS', numMonths: 38, bookingId }),
      this.prisonApiClient.getMainOffence(bookingId),
      this.prisonApiClient.getCourtCases(bookingId),
      this.prisonApiClient.getFullStatus(prisonerNumber),
      this.pathfinderApiClient.getNominal(prisonerNumber),
      this.manageSocCasesApiClient.getNominal(prisonerNumber),
    ])

    const [miniSummaryGroupA, miniSummaryGroupB, personalDetails, schedule, offencesOverview] = await Promise.all([
      this.getMiniSummaryGroupA(prisonerData, caseLoads, userRoles),
      this.getMiniSummaryGroupB(prisonerData, inmateDetail, caseLoads, userRoles),
      this.getPersonalDetails(prisonerData, inmateDetail),
      this.getSchedule(prisonerData),
      this.getOffencesOverview(
        imprisonmentStatusDescription,
        conditionalReleaseDate,
        confirmedReleaseDate,
        mainOffence,
        courtCaseData,
        fullStatus,
      ),
    ])

    const nonAssociations = this.getNonAssociations(nonAssociationDetails)
    const staffRolesRole = staffRoles.map(role => role.role)

    const overviewActions = this.buildOverviewActions(prisonerData, pathfinderNominal, socNominal, user, staffRolesRole)
    const overviewInfoLinks = this.buildOverviewInfoLinks(prisonerData, pathfinderNominal, socNominal, user)
    const canView = canViewCaseNotes(user, prisonerData)
    const canAdd = canAddCaseNotes(user, prisonerData)

    return {
      pageTitle: 'Overview',
      miniSummaryGroupA,
      miniSummaryGroupB,
      statuses: this.getStatuses(prisonerData, inmateDetail, learnerNeurodivergence, movements),
      nonAssociations,
      personalDetails,
      staffContacts: this.getStaffContacts(
        prisonerData,
        offenderContacts,
        allocationManager,
        offenderKeyWorker,
        keyWorkerSessions,
      ),
      schedule,
      offencesOverview,
      prisonName: prisonerData.prisonName,
      staffRoles: staffRolesRole,
      alertsSummary: this.getAlertsSummary(inmateDetail, nonAssociations, caseLoads),
      overviewActions,
      overviewInfoLinks,
      canView,
      canAdd,
      ...mapHeaderData(prisonerData, inmateDetail, user, 'overview'),
    }
  }

  public async getOffencesOverview(
    imprisonmentStatusDescription: string,
    conditionalReleaseDate: string,
    confirmedReleaseDate: string,
    mainOffence: MainOffence[],
    courtCaseData: CourtCase[],
    fullStatus: FullStatus,
  ) {
    const nextCourtAppearance = this.getNextCourtAppearanceForOverview(courtCaseData)

    const mainOffenceDescription = this.getMainOffenceDescription(mainOffence)
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

  getMainOffenceDescription(mainOffence: MainOffence[]): string {
    return mainOffence[0] && mainOffence[0].offenceDescription ? mainOffence[0].offenceDescription : 'Not entered'
  }

  getNextCourtAppearanceForOverview(courtCaseData: CourtCase[]) {
    const todaysDate = format(startOfToday(), 'yyyy-MM-dd')
    let nextCourtAppearance: CourtHearing = {} as CourtHearing
    if (Array.isArray(courtCaseData)) {
      courtCaseData.map((courtCase: CourtCase) => {
        const courtAppearance = this.offencesPageService.getNextCourtAppearance(courtCase, todaysDate)

        if (!nextCourtAppearance.dateTime && courtAppearance.dateTime) {
          nextCourtAppearance = courtAppearance
        } else if (courtAppearance.dateTime && nextCourtAppearance.dateTime) {
          const courtDate = format(new Date(courtAppearance.dateTime), 'yyyy-MM-dd')
          const currentNextDate = format(new Date(nextCourtAppearance.dateTime), 'yyyy-MM-dd')
          if (courtDate < currentNextDate) {
            nextCourtAppearance = courtAppearance
          }
        }
      })
    }
    return nextCourtAppearance
  }

  public getStaffContacts(
    prisonerData: Prisoner,
    offenderContacts: ContactDetail,
    allocationManager: Pom,
    offenderKeyWorker: KeyWorker,
    keyWorkerSessions: CaseNote[],
  ): StaffContacts {
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

    return {
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
      prisonOffenderManager: prisonOffenderManager
        ? `${prisonOffenderManager[0]} ${prisonOffenderManager[1]}`
        : 'Not assigned',
      coworkingPrisonOffenderManager: coworkingPrisonOffenderManager
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
  }

  public async getPersonalDetails(prisonerData: Prisoner, inmateDetail: InmateDetail): Promise<PersonalDetails> {
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
          text: 'Ethnic group',
        },
        value: {
          text: prisonerData.ethnicity ? prisonerData.ethnicity : 'Not entered',
        },
      },
      {
        key: {
          text: 'Religion or belief',
        },
        value: {
          text: prisonerData.religion ? prisonerData.religion : 'Not entered',
        },
      },
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
      this.adjudicationsApiClient.getAdjudications(bookingId),
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
      linkHref: `/prisoner/${prisonerNumber}/money/spends`,
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
    inmateDetail: InmateDetail,
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
        incentiveReviews?.iepDate,
        formatDateISO(new Date()),
      ),
      this.prisonApiClient.getCaseNoteCount(
        bookingId,
        CaseNoteType.NegativeBehaviour,
        CaseNoteSubType.IncentiveWarning,
        incentiveReviews?.iepDate,
        formatDateISO(new Date()),
      ),
    ])

    const category: Assessment =
      prisonerData.assessments?.find(
        (assessment: Assessment) => assessment.assessmentCode === AssessmentCode.category,
      ) || null
    const csra: Assessment =
      prisonerData.assessments?.find((assessment: Assessment) =>
        assessment.assessmentDescription.includes(AssessmentCode.csra),
      ) || null

    const belongsToCaseLoad = prisonerBelongsToUsersCaseLoad(prisonId, userCaseLoads)

    const categorySummaryData: MiniSummaryData = {
      bottomLabel: 'Category',
      bottomContentLine1: formatCategoryCodeDescription(category?.classificationCode, inmateDetail.category),
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
      bottomContentLine3: `Next review by: ${formatDate(incentiveReviews?.nextReviewDate, 'short')}`,
      bottomContentError: isAfter(new Date(), new Date(incentiveReviews?.nextReviewDate))
        ? `${pluralise(differenceInDays(new Date(), new Date(incentiveReviews?.nextReviewDate)), 'day')} overdue`
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

    if (belongsToCaseLoad || userHasRoles([Role.GlobalSearch], userRoles)) {
      summaryData.push({ data: incentiveSummaryData, classes: 'govuk-grid-row card-body' })
    }

    summaryData.push({ data: csraSummaryData, classes: 'govuk-grid-row card-body' })

    return summaryData
  }

  private getAlertsSummary(
    { activeAlertCount, offenderNo }: InmateDetail,
    nonAssociations: OverviewNonAssociation[],
    userCaseloads: CaseLoad[],
  ): AlertsSummary {
    const activeCaseload = userCaseloads.find(caseload => caseload.currentlyActive)
    const nonAssociationsCount = nonAssociations.length
    const showNonAssociationsLink = nonAssociationsEnabled(activeCaseload?.caseLoadId)
    const nonAssociationsUrl = `${config.serviceUrls.nonAssociations}/prisoner/${offenderNo}/non-associations`

    return { activeAlertCount, nonAssociationsCount, showNonAssociationsLink, nonAssociationsUrl }
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
      linkUrl: `/prisoner/${prisonerData.prisonerNumber}/schedule`,
    }
  }

  private getNonAssociations(nonAssociations: NonAssociationDetails): OverviewNonAssociation[] {
    if (!nonAssociations?.nonAssociations) return []

    return nonAssociations.nonAssociations.map(nonAssociation => {
      const { firstName, lastName, offenderNo, assignedLivingUnitDescription, reasonDescription, agencyId } =
        nonAssociation.offenderNonAssociation
      return {
        nonAssociationName: `${firstName} ${lastName}`,
        offenderNo,
        assignedLivingUnitDescription,
        reasonDescription,
        agencyId,
      }
    })
  }

  private getStatuses(
    prisonerData: Prisoner,
    inmateDetail: InmateDetail,
    learnerNeurodivergence: LearnerNeurodivergence[],
    movements: Movement[],
  ): Status[] {
    const statusList: Status[] = []

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

    // Neurodiversity support needed
    if (learnerNeurodivergence?.length) {
      statusList.push({
        label: 'Support needed',
        subText: 'Has neurodiversity needs',
      })
    }

    if (movements.length > 0) {
      const movement = movements.find(m => m.offenderNo === prisonerData.prisonerNumber)
      if (isAfter(new Date(movement.movementDate), startOfToday())) {
        statusList.push({ label: 'Scheduled transfer', subText: `To ${movement.toAgencyDescription}` })
      }
    }

    return statusList
  }

  private buildOverviewActions(
    prisonerData: Prisoner,
    pathfinderNominal: Nominal,
    socNominal: Nominal,
    user: User,
    staffRoles: string[] = [],
  ): HmppsAction[] {
    const actions: HmppsAction[] = []
    if (canViewCalculateReleaseDates(user)) {
      actions.push({
        text: 'Calculate release dates',
        icon: Icon.CalculateReleaseDates,
        url: `${config.serviceUrls.calculateReleaseDates}/?prisonId=${prisonerData.prisonerNumber}`,
        dataQA: 'calculate-release-dates-action-link',
      })
    }
    if (canAddCaseNotes(user, prisonerData)) {
      actions.push({
        text: 'Add case note',
        icon: Icon.AddCaseNote,
        url: `/prisoner/${prisonerData.prisonerNumber}/add-case-note`,
        dataQA: 'add-case-note-action-link',
      })
    }
    if (staffRoles.includes('KW')) {
      actions.push({
        text: 'Add key worker session',
        icon: Icon.AddKeyWorkerSession,
        url: `/prisoner/${prisonerData.prisonerNumber}/add-case-note?type=KA&subType=KS`,
        dataQA: 'add-key-worker-session-action-link',
      })
    }
    if (userCanEdit(user, prisonerData) && !prisonerData.restrictedPatient) {
      actions.push({
        text: 'Add appointment',
        icon: Icon.AddAppointment,
        url: `${config.serviceUrls.digitalPrison}/offenders/${prisonerData.prisonerNumber}/add-appointment`,
        dataQA: 'add-appointment-action-link',
      })
    }
    if (userCanEdit(user, prisonerData) && !prisonerData.restrictedPatient) {
      actions.push({
        text: 'Report use of force',
        icon: Icon.ReportUseOfForce,
        url: `${config.serviceUrls.useOfForce}/report/${prisonerData.bookingId}/report-use-of-force`,
        dataQA: 'report-use-of-force-action-link',
      })
    }
    if (
      userHasRoles([Role.ActivityHub], user.userRoles) &&
      config.activitiesEnabledPrisons.includes(user.activeCaseLoadId) &&
      user.activeCaseLoadId === prisonerData.prisonId &&
      prisonerData.status !== 'ACTIVE OUT'
    ) {
      actions.push({
        text: 'Log an activity application',
        icon: Icon.LogActivityApplication,
        url: `${config.serviceUrls.activities}/waitlist/${prisonerData.prisonerNumber}/apply`,
        dataQA: 'log-an-activity-application-link',
      })
    }
    if (
      userHasRoles(
        [Role.PathfinderApproval, Role.PathfinderStdPrison, Role.PathfinderStdProbation, Role.PathfinderHQ],
        user.userRoles,
      ) &&
      !pathfinderNominal
    ) {
      actions.push({
        text: 'Refer to Pathfinder',
        icon: Icon.ReferToPathfinder,
        url: `${config.serviceUrls.pathfinder}/refer/offender/${prisonerData.prisonerNumber}`,
        dataQA: 'refer-to-pathfinder-action-link',
      })
    }
    if (userHasRoles([Role.SocCustody, Role.SocCommunity], user.userRoles) && !socNominal) {
      actions.push({
        text: 'Add to SOC',
        icon: Icon.AddToSOC,
        url: `${config.serviceUrls.manageSocCases}/refer/offender/${prisonerData.prisonerNumber}`,
        dataQA: 'add-to-soc-action-link',
      })
    }
    if (
      userHasRoles(
        [
          Role.CreateCategorisation,
          Role.ApproveCategorisation,
          Role.CreateRecategorisation,
          Role.CategorisationSecurity,
        ],
        user.userRoles,
      )
    ) {
      actions.push({
        text: 'Manage category',
        icon: Icon.ManageCategory,
        url: `${config.serviceUrls.offenderCategorisation}/${prisonerData.bookingId}`,
        dataQA: 'manage-category-action-link',
      })
    }

    return actions
  }

  private buildOverviewInfoLinks(
    prisonerData: Prisoner,
    pathfinderNominal: Nominal,
    socNominal: Nominal,
    user: User,
  ): { text: string; url: string; dataQA: string }[] {
    const links: { text: string; url: string; dataQA: string }[] = []

    if (
      userHasRoles([Role.PomUser, Role.ViewProbationDocuments], user.userRoles) &&
      (prisonerBelongsToUsersCaseLoad(prisonerData.prisonId, user.caseLoads) ||
        ['OUT', 'TRN'].includes(prisonerData.prisonId))
    ) {
      links.push({
        text: 'Probation documents',
        url: `${config.serviceUrls.digitalPrison}/offenders/${prisonerData.prisonerNumber}/probation-documents`,
        dataQA: 'probation-documents-info-link',
      })
    }

    if (
      userHasRoles(
        [
          Role.PathfinderApproval,
          Role.PathfinderStdPrison,
          Role.PathfinderStdProbation,
          Role.PathfinderHQ,
          Role.PathfinderUser,
          Role.PathfinderLocalReader,
          Role.PathfinderNationalReader,
          Role.PathfinderPolice,
          Role.PathfinderPsychologist,
        ],
        user.userRoles,
      ) &&
      pathfinderNominal
    ) {
      links.push({
        text: 'Pathfinder profile',
        url: `${config.serviceUrls.pathfinder}/nominal/${pathfinderNominal.id}`,
        dataQA: 'pathfinder-profile-info-link',
      })
    }

    if (userHasRoles([Role.SocCommunity, Role.SocCustody], user.userRoles) && socNominal) {
      links.push({
        text: 'SOC profile',
        url: `${config.serviceUrls.manageSocCases}/nominal/${socNominal.id}`,
        dataQA: 'soc-profile-info-link',
      })
    }

    return links
  }
}
