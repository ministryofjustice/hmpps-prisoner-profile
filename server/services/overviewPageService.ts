import { differenceInDays, isAfter } from 'date-fns'
import MiniSummary, { MiniSummaryData } from './interfaces/overviewPageService/MiniSummary'
import OverviewPage, { OverviewSchedule, OverviewScheduleItem } from './interfaces/overviewPageService/OverviewPage'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import {
  calculateAge,
  convertToTitleCase,
  formatCategoryCodeDescription,
  formatCommunityManager,
  formatMoney,
  formatName,
  formatPrivilegedVisitsSummary,
  getNamesFromString,
  neurodiversityEnabled,
  prisonerBelongsToUsersCaseLoad,
  sortArrayOfObjectsByDate,
  SortType,
  userHasRoles,
} from '../utils/utils'
import Assessment from '../data/interfaces/prisonApi/Assessment'
import { AssessmentCode } from '../data/enums/assessmentCode'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import PersonalDetails from './interfaces/overviewPageService/PersonalDetails'
import StaffContacts, { Contact, ContactDetail, YouthStaffContacts } from '../data/interfaces/prisonApi/StaffContacts'
import KeyWorkerClient from '../data/interfaces/keyWorkerApi/keyWorkerClient'
import ScheduledEvent from '../data/interfaces/prisonApi/ScheduledEvent'
import groupEventsByPeriod from '../utils/groupEventsByPeriod'
import Status from './interfaces/overviewPageService/Status'
import { getProfileInformationValue, ProfileInformationType } from '../data/interfaces/prisonApi/ProfileInformation'
import { BooleanString } from '../data/enums/booleanString'
import { pluralise } from '../utils/pluralise'
import { formatDate, formatDateISO } from '../utils/dateHelpers'
import { IncentivesApiClient } from '../data/interfaces/incentivesApi/incentivesApiClient'
import { CaseNoteSubType, CaseNoteType } from '../data/enums/caseNoteType'
import OffencesPageService from './offencesPageService'
import config from '../config'
import { Role } from '../data/enums/role'
import CaseLoad from '../data/interfaces/prisonApi/CaseLoad'
import { formatScheduledEventTime } from '../utils/formatScheduledEventTime'
import MainOffence from '../data/interfaces/prisonApi/MainOffence'
import { RestClientBuilder } from '../data'
import InmateDetail from '../data/interfaces/prisonApi/InmateDetail'
import { NonAssociationsApiClient } from '../data/interfaces/nonAssociationsApi/nonAssociationsApiClient'
import CaseNote from '../data/interfaces/prisonApi/CaseNote'
import FullStatus from '../data/interfaces/prisonApi/FullStatus'
import CommunityManager from '../data/interfaces/deliusApi/CommunityManager'
import { PrisonerProfileDeliusApiClient } from '../data/interfaces/deliusApi/prisonerProfileDeliusApiClient'
import { PrisonerPrisonSchedule } from '../data/interfaces/prisonApi/PrisonerSchedule'
import PrisonerDetail from '../data/interfaces/prisonApi/PrisonerDetail'
import NonAssociationSummary from './interfaces/overviewPageService/NonAssociationSummary'
import PrisonerNonAssociations from '../data/interfaces/nonAssociationsApi/PrisonerNonAssociations'
import { Result } from '../utils/result/result'
import AdjudicationsApiClient from '../data/interfaces/adjudicationsApi/adjudicationsApiClient'
import Pom from '../data/interfaces/allocationManagerApi/Pom'
import AllocationManagerClient from '../data/interfaces/allocationManagerApi/allocationManagerClient'
import ComplexityApiClient from '../data/interfaces/complexityApi/complexityApiClient'
import { ComplexityLevel } from '../data/interfaces/complexityApi/ComplexityOfNeed'
import CuriousApiClient from '../data/interfaces/curiousApi/curiousApiClient'
import LearnerNeurodivergence from '../data/interfaces/curiousApi/LearnerNeurodivergence'
import { youthEstatePrisons } from '../data/constants/youthEstatePrisons'
import { ContactRelationship } from '../data/enums/ContactRelationship'

export default class OverviewPageService {
  constructor(
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly allocationManagerApiClientBuilder: RestClientBuilder<AllocationManagerClient>,
    private readonly keyworkerApiClientBuilder: RestClientBuilder<KeyWorkerClient>,
    private readonly incentivesApiClientBuilder: RestClientBuilder<IncentivesApiClient>,
    private readonly adjudicationsApiClientBuilder: RestClientBuilder<AdjudicationsApiClient>,
    private readonly offencesPageService: OffencesPageService,
    private readonly curiousApiClientBuilder: RestClientBuilder<CuriousApiClient>,
    private readonly nonAssociationsApiClientBuilder: RestClientBuilder<NonAssociationsApiClient>,
    private readonly prisonerProfileDeliusApiClientBuilder: RestClientBuilder<PrisonerProfileDeliusApiClient>,
    private readonly complexityApiClientBuilder: RestClientBuilder<ComplexityApiClient>,
  ) {}

  public async get({
    clientToken,
    prisonerData,
    staffId,
    inmateDetail,
    userCaseLoads = [],
    userRoles = [],
    apiErrorCallback = () => null,
  }: {
    clientToken: string
    prisonerData: Prisoner
    staffId: number
    inmateDetail: InmateDetail
    userCaseLoads?: CaseLoad[]
    userRoles?: string[]
    apiErrorCallback?: (error: Error) => void
  }): Promise<OverviewPage> {
    const {
      bookingId,
      prisonerNumber,
      imprisonmentStatusDescription,
      conditionalReleaseDate,
      confirmedReleaseDate,
      prisonId,
    } = prisonerData

    const prisonApiClient = this.prisonApiClientBuilder(clientToken)
    const allocationManagerClient = this.allocationManagerApiClientBuilder(clientToken)
    const keyWorkerClient = this.keyworkerApiClientBuilder(clientToken)
    const incentivesApiClient = this.incentivesApiClientBuilder(clientToken)
    const adjudicationsApiClient = this.adjudicationsApiClientBuilder(clientToken)
    const curiousApiClient = this.curiousApiClientBuilder(clientToken)
    const nonAssociationsApiClient = this.nonAssociationsApiClientBuilder(clientToken)
    const prisonerProfileDeliusApiClient = this.prisonerProfileDeliusApiClientBuilder(clientToken)
    const complexityApiClient = this.complexityApiClientBuilder(clientToken)

    const getLearnerNeurodivergence = async (): Promise<LearnerNeurodivergence[]> => {
      if (!neurodiversityEnabled(prisonerData.prisonId)) return []
      return curiousApiClient.getLearnerNeurodivergence(prisonerData.prisonerNumber)
    }

    const getKeyWorkerName = async (): Promise<string> => {
      const complexityLevel =
        config.featureToggles.complexityEnabledPrisons.includes(prisonId) &&
        (await complexityApiClient.getComplexityOfNeed(prisonerNumber))?.level

      if (complexityLevel === ComplexityLevel.High) return 'None - high complexity of need'

      const keyWorker = await keyWorkerClient.getOffendersKeyWorker(prisonerData.prisonerNumber)
      return keyWorker && keyWorker.firstName
        ? `${convertToTitleCase(keyWorker.firstName)} ${convertToTitleCase(keyWorker.lastName)}`
        : 'Not allocated'
    }

    const activeCaseloadId = userCaseLoads.find(caseload => caseload.currentlyActive)?.caseLoadId

    const isYouthPrisoner = youthEstatePrisons.includes(prisonerData.prisonId)

    const [
      staffRoles,
      learnerNeurodivergence,
      scheduledTransfers,
      prisonerNonAssociations,
      allocationManager,
      keyWorkerName,
      keyWorkerSessions,
      mainOffence,
      fullStatus,
      communityManager,
      prisonerDetail,
      contacts,
    ] = await Promise.all([
      activeCaseloadId ? prisonApiClient.getStaffRoles(staffId, activeCaseloadId) : [],
      Result.wrap(getLearnerNeurodivergence(), apiErrorCallback),
      prisonApiClient.getScheduledTransfers(prisonerData.prisonerNumber),
      nonAssociationsApiClient.getPrisonerNonAssociations(prisonerNumber, { includeOtherPrisons: 'true' }),
      isYouthPrisoner ? null : allocationManagerClient.getPomByOffenderNo(prisonerData.prisonerNumber),
      Result.wrap(isYouthPrisoner ? null : getKeyWorkerName(), apiErrorCallback),
      prisonApiClient.getCaseNoteSummaryByTypes({ type: 'KA', subType: 'KS', numMonths: 38, bookingId }),
      prisonApiClient.getMainOffence(bookingId),
      prisonApiClient.getFullStatus(prisonerNumber),
      isYouthPrisoner ? null : prisonerProfileDeliusApiClient.getCommunityManager(prisonerNumber),
      prisonApiClient.getPrisoner(prisonerNumber),
      isYouthPrisoner ? prisonApiClient.getBookingContacts(bookingId) : null,
    ])

    const [miniSummaryGroupA, miniSummaryGroupB, personalDetails, schedule, offencesOverview] = await Promise.all([
      this.getMiniSummaryGroupA(prisonerData, userCaseLoads, userRoles, prisonApiClient, adjudicationsApiClient),
      this.getMiniSummaryGroupB(
        prisonerData,
        inmateDetail,
        userCaseLoads,
        userRoles,
        incentivesApiClient,
        prisonApiClient,
      ),
      this.getPersonalDetails(prisonerData, inmateDetail, prisonerDetail),
      this.getSchedule(prisonerData, prisonApiClient),
      this.getOffencesOverview(
        imprisonmentStatusDescription,
        conditionalReleaseDate,
        confirmedReleaseDate,
        mainOffence,
        fullStatus,
      ),
    ])

    const staffContacts = isYouthPrisoner
      ? this.getYouthStaffContacts(contacts, prisonerNumber)
      : this.getStaffContacts(prisonerNumber, communityManager, allocationManager, keyWorkerName, keyWorkerSessions)

    return {
      miniSummaryGroupA,
      miniSummaryGroupB,
      statuses: this.getStatuses(prisonerData, inmateDetail, learnerNeurodivergence, scheduledTransfers),
      nonAssociationSummary: this.getNonAssociationSummary(prisonerNonAssociations),
      personalDetails,
      staffContacts,
      schedule,
      offencesOverview,
      prisonName: prisonerData.prisonName,
      staffRoles: staffRoles?.map(role => role.role),
      isYouthPrisoner,
    }
  }

  public async getOffencesOverview(
    imprisonmentStatusDescription: string,
    conditionalReleaseDate: string,
    confirmedReleaseDate: string,
    mainOffence: MainOffence[],
    fullStatus: FullStatus,
  ) {
    const mainOffenceDescription = await this.getMainOffenceDescription(mainOffence)
    return {
      mainOffenceDescription,
      fullStatus,
      imprisonmentStatusDescription,
      conditionalReleaseDate,
      confirmedReleaseDate,
    }
  }

  async getMainOffenceDescription(mainOffence: MainOffence[]): Promise<string> {
    return mainOffence[0] && mainOffence[0].offenceDescription ? mainOffence[0].offenceDescription : 'Not entered'
  }

  public getStaffContacts(
    prisonerNumber: string,
    communityManager: CommunityManager,
    allocationManager: Pom,
    keyWorkerName: Result<string>,
    keyWorkerSessions: CaseNote[],
  ): StaffContacts {
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
      keyWorker: keyWorkerName
        .map(name => ({
          name,
          lastSession:
            keyWorkerSessions !== undefined && keyWorkerSessions[0] !== undefined
              ? formatDate(keyWorkerSessions[0].latestCaseNote, 'short')
              : '',
        }))
        .toPromiseSettledResult(),
      prisonOffenderManager: prisonOffenderManager
        ? `${prisonOffenderManager[0]} ${prisonOffenderManager[1]}`
        : 'Not assigned',
      coworkingPrisonOffenderManager: coworkingPrisonOffenderManager
        ? `${coworkingPrisonOffenderManager[0]} ${coworkingPrisonOffenderManager[1]}`
        : 'Not assigned',
      communityOffenderManager: formatCommunityManager(communityManager),
      linkUrl: `/prisoner/${prisonerNumber}/professional-contacts`,
    }
  }

  public getYouthStaffContacts(contacts: ContactDetail, prisonerNumber: string): YouthStaffContacts {
    const youthStaffContacts = {
      cuspOfficer: 'Not assigned',
      cuspOfficerBackup: 'Not assigned',
      youthJusticeWorker: 'Not assigned',
      resettlementPractitioner: 'Not assigned',
      youthJusticeService: 'Not assigned',
      youthJusticeServiceCaseManager: 'Not assigned',
      linkUrl: `/prisoner/${prisonerNumber}/professional-contacts`,
    }

    // Return the most recently created record for each of the YOI contact relationships if available
    sortArrayOfObjectsByDate<Contact>(contacts.otherContacts, 'createdDateTime', SortType.ASC).forEach(c => {
      switch (c.relationship) {
        case ContactRelationship.CuspOfficer:
          youthStaffContacts.cuspOfficer = formatName(c.firstName, null, c.lastName)
          break
        case ContactRelationship.CuspOfficerBackup:
          youthStaffContacts.cuspOfficerBackup = formatName(c.firstName, null, c.lastName)
          break
        case ContactRelationship.YouthJusticeWorker:
          youthStaffContacts.youthJusticeWorker = formatName(c.firstName, null, c.lastName)
          break
        case ContactRelationship.ResettlementPractitioner:
          youthStaffContacts.resettlementPractitioner = formatName(c.firstName, null, c.lastName)
          break
        case ContactRelationship.YouthJusticeService:
          youthStaffContacts.youthJusticeService = formatName(c.firstName, null, c.lastName)
          break
        case ContactRelationship.YouthJusticeServiceCaseManager:
          youthStaffContacts.youthJusticeServiceCaseManager = formatName(c.firstName, null, c.lastName)
          break
        default:
      }
    })

    return youthStaffContacts
  }

  public async getPersonalDetails(
    prisonerData: Prisoner,
    inmateDetail: InmateDetail,
    prisonerDetail: PrisonerDetail,
  ): Promise<PersonalDetails> {
    let ethnicGroup = 'Not entered'
    if (prisonerDetail?.ethnicity) {
      ethnicGroup = `${prisonerDetail?.ethnicity}`
      if (prisonerDetail?.ethnicityCode) {
        ethnicGroup += ` (${prisonerDetail.ethnicityCode})`
      }
    }

    return {
      personalDetailsMain: {
        preferredName: prisonerData.firstName ? `${convertToTitleCase(prisonerData.firstName)}` : 'None',
        dateOfBirth: prisonerData.dateOfBirth ? formatDate(prisonerData.dateOfBirth, 'short') : 'None',
        age: prisonerData.dateOfBirth ? calculateAge(prisonerData.dateOfBirth) : null,
        nationality: prisonerData.nationality ? prisonerData.nationality : 'None',
        spokenLanguage: inmateDetail.language ? inmateDetail.language : 'No language entered',
      },
      personalDetailsSide: {
        ethnicGroup,
        religionOrBelief: prisonerData.religion ? prisonerData.religion : 'Not entered',
        croNumber: prisonerData.croNumber ? prisonerData.croNumber : 'None',
        pncNumber: prisonerData.pncNumber ? prisonerData.pncNumber : 'None',
      },
    }
  }

  private async getMiniSummaryGroupA(
    prisonerData: Prisoner,
    userCaseLoads: CaseLoad[],
    userRoles: string[],
    prisonApiClient: PrisonApiClient,
    adjudicationsApiClient: AdjudicationsApiClient,
  ): Promise<MiniSummary[]> {
    const { prisonerNumber, bookingId, prisonId } = prisonerData
    const [accountBalances, adjudicationSummary, visitSummary, visitBalances] = await Promise.all([
      prisonApiClient.getAccountBalances(bookingId),
      adjudicationsApiClient.getAdjudications(bookingId),
      prisonApiClient.getVisitSummary(bookingId),
      prisonApiClient.getVisitBalances(prisonerNumber),
    ])

    let privilegedVisitsDescription = ''
    if (visitBalances?.remainingPvo) {
      privilegedVisitsDescription = formatPrivilegedVisitsSummary(visitBalances.remainingPvo)
    } else if (visitBalances?.remainingVo) {
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
        ? `${config.serviceUrls.adjudications}/active-punishments/${prisonerNumber}`
        : undefined,
      bottomClass: 'small',
      linkLabel: 'Adjudication history',
      linkHref: `${config.serviceUrls.adjudications}/adjudication-history/${prisonerNumber}`,
    }

    const visitsSummaryData: MiniSummaryData = {
      heading: 'Visits',
      topLabel: 'Next visit date',
      topContent: visitSummary.startDateTime ? formatDate(visitSummary.startDateTime, 'short') : 'None scheduled',
      topClass: visitSummary.startDateTime ? 'big' : 'small',
      bottomLabel: 'Remaining visits',
      bottomContentLine1: visitBalances?.remainingVo ? visitBalances.remainingVo : '0',
      bottomContentLine3: privilegedVisitsDescription,
      bottomClass: visitBalances?.remainingVo ? 'small' : 'big',
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
    incentivesApiClient: IncentivesApiClient,
    prisonApiClient: PrisonApiClient,
  ): Promise<MiniSummary[]> {
    const { prisonerNumber, bookingId, prisonId } = prisonerData

    let incentiveSummaryData: MiniSummaryData

    try {
      const incentiveReviews = await incentivesApiClient.getReviews(bookingId)

      if (incentiveReviews === null) {
        // Fallback if incentives API returns 404
        incentiveSummaryData = {
          bottomLabel: 'Incentives: since last review',
          bottomContentLine1: `${formatName(
            prisonerData.firstName,
            null,
            prisonerData.lastName,
          )} has no incentive level history`,
          bottomClass: 'small',
          linkLabel: 'Incentive level details',
          linkHref: `${config.serviceUrls.incentives}/incentive-reviews/prisoner/${prisonerData.prisonerNumber}`,
        }
      }

      if (incentiveReviews) {
        const [positiveBehaviourCount, negativeBehaviourCount] = await Promise.all([
          prisonApiClient.getCaseNoteCount(
            bookingId,
            CaseNoteType.PositiveBehaviour,
            CaseNoteSubType.IncentiveEncouragement,
            incentiveReviews?.iepDate,
            formatDateISO(new Date()),
          ),
          prisonApiClient.getCaseNoteCount(
            bookingId,
            CaseNoteType.NegativeBehaviour,
            CaseNoteSubType.IncentiveWarning,
            incentiveReviews?.iepDate,
            formatDateISO(new Date()),
          ),
        ])

        incentiveSummaryData = {
          bottomLabel: 'Incentives: since last review',
          bottomContentLine1: `Positive behaviours: ${positiveBehaviourCount.count}`,
          bottomContentLine2: `Negative behaviours: ${negativeBehaviourCount.count}`,
          bottomContentLine3: `Next review by: ${formatDate(incentiveReviews?.nextReviewDate, 'short')}`,
          bottomContentError: isAfter(new Date(), new Date(incentiveReviews?.nextReviewDate))
            ? `${pluralise(differenceInDays(new Date(), new Date(incentiveReviews?.nextReviewDate)), 'day')} overdue`
            : undefined,
          bottomClass: 'small',
          linkLabel: 'Incentive level details',
          linkHref: `${config.serviceUrls.incentives}/incentive-reviews/prisoner/${prisonerData.prisonerNumber}`,
        }
      }
    } catch (e) {
      // Fallback if incentives API returns an error
      incentiveSummaryData = {
        bottomLabel: 'Incentives: since last review',
        bottomContentLine1: 'We cannot show these details right now',
        bottomClass: 'small',
        linkLabel: 'Incentive level details',
        linkHref: `${config.serviceUrls.incentives}/incentive-reviews/prisoner/${prisonerData.prisonerNumber}`,
      }
    }

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
        : 'Category'
      categorySummaryData.linkHref = `${config.serviceUrls.offenderCategorisation}/${bookingId}`
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
      csraSummaryData.linkHref = `/prisoner/${prisonerNumber}/csra-history`
    }

    const summaryData = []

    summaryData.push({ data: categorySummaryData, classes: 'govuk-grid-row card-body' })

    if (belongsToCaseLoad || userHasRoles([Role.GlobalSearch], userRoles)) {
      summaryData.push({ data: incentiveSummaryData, classes: 'govuk-grid-row card-body' })
    }

    summaryData.push({ data: csraSummaryData, classes: 'govuk-grid-row card-body' })

    return summaryData
  }

  private async getSchedule(prisonerData: Prisoner, prisonApiClient: PrisonApiClient): Promise<OverviewSchedule> {
    const formatEventForOverview = (event: ScheduledEvent): OverviewScheduleItem => {
      const name = event.eventSubType === 'PA' ? event.eventSourceDesc : event.eventSubTypeDesc
      const { startTime, endTime } = formatScheduledEventTime(event)

      return {
        name,
        startTime,
        endTime,
      }
    }

    const scheduledEvents = await prisonApiClient.getEventsScheduledForToday(prisonerData.bookingId)
    const groupedEvents = groupEventsByPeriod(scheduledEvents)

    return {
      morning: groupedEvents.morningEvents.map(formatEventForOverview),
      afternoon: groupedEvents.afternoonEvents.map(formatEventForOverview),
      evening: groupedEvents.eveningEvents.map(formatEventForOverview),
      linkUrl: `/prisoner/${prisonerData.prisonerNumber}/schedule`,
    }
  }

  private getNonAssociationSummary(prisonerNonAssociations: PrisonerNonAssociations): NonAssociationSummary {
    const prisonCount = prisonerNonAssociations.nonAssociations.filter(
      na => na.otherPrisonerDetails.prisonId === prisonerNonAssociations.prisonId,
    ).length
    const otherPrisonsCount = prisonerNonAssociations.nonAssociations.filter(
      na =>
        na.otherPrisonerDetails.prisonId !== prisonerNonAssociations.prisonId &&
        !['TRN', 'OUT'].includes(na.otherPrisonerDetails.prisonId),
    ).length
    return {
      prisonName: prisonerNonAssociations.prisonName,
      prisonCount,
      otherPrisonsCount,
      nonAssociationsUrl: `${config.serviceUrls.nonAssociations}/prisoner/${prisonerNonAssociations.prisonerNumber}/non-associations`,
    }
  }

  private getStatuses(
    prisonerData: Prisoner,
    inmateDetail: InmateDetail,
    learnerNeurodivergence: Result<LearnerNeurodivergence[]>,
    scheduledTransfers: PrisonerPrisonSchedule[],
  ): Status[] {
    return [
      ...this.getLocationStatus(prisonerData),
      ...this.getListenerStatus(inmateDetail),
      ...this.getNeurodiversitySupportStatus(learnerNeurodivergence),
      ...this.getScheduledTransferStatus(scheduledTransfers),
    ]
  }

  private getLocationStatus(prisonerData: Prisoner): Status[] {
    if (prisonerData.inOutStatus === 'IN') {
      return [{ label: `In ${prisonerData.prisonName}` }]
    }
    if (prisonerData.status === 'ACTIVE OUT') {
      return [{ label: `Out from ${prisonerData.prisonName}` }]
    }
    if (prisonerData.status === 'INACTIVE OUT') {
      return [{ label: prisonerData.locationDescription }]
    }
    if (prisonerData.inOutStatus === 'TRN') {
      return [{ label: 'Being transferred' }]
    }
    return []
  }

  private getListenerStatus(inmateDetail: InmateDetail): Status[] {
    const recognised = getProfileInformationValue(
      ProfileInformationType.RecognisedListener,
      inmateDetail.profileInformation,
    )
    const suitable = getProfileInformationValue(
      ProfileInformationType.SuitableListener,
      inmateDetail.profileInformation,
    )

    if (recognised === BooleanString.Yes) {
      return [{ label: 'Recognised Listener' }]
    }

    if (suitable === BooleanString.Yes) {
      return [{ label: 'Suitable Listener' }]
    }

    return []
  }

  private getNeurodiversitySupportStatus(learnerNeurodivergence: Result<LearnerNeurodivergence[]>): Status[] {
    const supportNeededStatus = { label: 'Support needed', subText: 'Has neurodiversity needs' }
    const supportNeededErrorStatus = { label: 'Support needs unavailable', subText: 'Try again later', error: true }
    return learnerNeurodivergence.handle({
      fulfilled: it => (it?.length && [supportNeededStatus]) || [],
      rejected: () => [supportNeededErrorStatus],
    })
  }

  private getScheduledTransferStatus(scheduledTransfers: PrisonerPrisonSchedule[]): Status[] {
    return (
      (scheduledTransfers?.length > 0 && [
        {
          label: 'Scheduled transfer',
          subText: `To ${scheduledTransfers[0].eventLocation}`,
        },
      ]) ||
      []
    )
  }
}
