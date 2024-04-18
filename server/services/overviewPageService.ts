import OverviewPage from './interfaces/overviewPageService/OverviewPage'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import {
  calculateAge,
  convertToTitleCase,
  formatCommunityManager,
  formatName,
  getNamesFromString,
  neurodiversityEnabled,
  sortArrayOfObjectsByDate,
  SortType,
} from '../utils/utils'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import StaffContacts, { Contact, ContactDetail, YouthStaffContacts } from '../data/interfaces/prisonApi/StaffContacts'
import KeyWorkerClient from '../data/interfaces/keyWorkerApi/keyWorkerClient'
import { getProfileInformationValue, ProfileInformationType } from '../data/interfaces/prisonApi/ProfileInformation'
import { BooleanString } from '../data/enums/booleanString'
import { formatDate } from '../utils/dateHelpers'
import { IncentivesApiClient } from '../data/interfaces/incentivesApi/incentivesApiClient'
import config from '../config'
import CaseLoad from '../data/interfaces/prisonApi/CaseLoad'
import { RestClientBuilder } from '../data'
import InmateDetail from '../data/interfaces/prisonApi/InmateDetail'
import { NonAssociationsApiClient } from '../data/interfaces/nonAssociationsApi/nonAssociationsApiClient'
import CaseNote from '../data/interfaces/prisonApi/CaseNote'
import CommunityManager from '../data/interfaces/deliusApi/CommunityManager'
import { PrisonerProfileDeliusApiClient } from '../data/interfaces/deliusApi/prisonerProfileDeliusApiClient'
import { PrisonerPrisonSchedule } from '../data/interfaces/prisonApi/PrisonerSchedule'
import PrisonerDetail from '../data/interfaces/prisonApi/PrisonerDetail'
import PrisonerNonAssociations from '../data/interfaces/nonAssociationsApi/PrisonerNonAssociations'
import { Result } from '../utils/result/result'
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
    apiErrorCallback = () => null,
  }: {
    clientToken: string
    prisonerData: Prisoner
    staffId: number
    inmateDetail: InmateDetail
    userCaseLoads?: CaseLoad[]
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

    const staffContacts = isYouthPrisoner
      ? this.getYouthStaffContacts(contacts)
      : this.getStaffContacts(communityManager, allocationManager, keyWorkerName, keyWorkerSessions)

    return {
      statuses: this.getStatuses(prisonerData, inmateDetail, learnerNeurodivergence, scheduledTransfers),
      nonAssociationSummary: this.getNonAssociationSummary(prisonerNonAssociations),
      personalDetails: this.getPersonalDetails(prisonerData, inmateDetail, prisonerDetail),
      staffContacts,
      offencesOverview: {
        mainOffenceDescription: mainOffence[0]?.offenceDescription,
        fullStatus,
        imprisonmentStatusDescription,
        conditionalReleaseDate,
        confirmedReleaseDate,
      },
      prisonName: prisonerData.prisonName,
      staffRoles: staffRoles?.map(role => role.role),
      isYouthPrisoner,
    }
  }

  private getStaffContacts(
    communityManager: CommunityManager,
    allocationManager: Pom,
    keyWorkerName: Result<string>,
    keyWorkerSessions: CaseNote[],
  ): StaffContacts {
    const prisonOffenderManager =
      allocationManager?.primary_pom?.name && getNamesFromString(allocationManager.primary_pom.name)

    const coworkingPrisonOffenderManager =
      allocationManager?.secondary_pom?.name && getNamesFromString(allocationManager.secondary_pom.name)

    return {
      keyWorker: keyWorkerName
        .map(name => ({
          name,
          lastSession:
            keyWorkerSessions?.[0] !== undefined ? formatDate(keyWorkerSessions[0].latestCaseNote, 'short') : '',
        }))
        .toPromiseSettledResult(),
      prisonOffenderManager: prisonOffenderManager && `${prisonOffenderManager[0]} ${prisonOffenderManager[1]}`,

      coworkingPrisonOffenderManager:
        coworkingPrisonOffenderManager && `${coworkingPrisonOffenderManager[0]} ${coworkingPrisonOffenderManager[1]}`,

      communityOffenderManager: formatCommunityManager(communityManager),
    }
  }

  private getYouthStaffContacts(contacts: ContactDetail): YouthStaffContacts {
    const youthStaffContacts: YouthStaffContacts = {
      cuspOfficer: null,
      cuspOfficerBackup: null,
      youthJusticeWorker: null,
      resettlementPractitioner: null,
      youthJusticeService: null,
      youthJusticeServiceCaseManager: null,
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

  private getEthnicGroupText(prisonerDetail: PrisonerDetail): string {
    const { ethnicity, ethnicityCode } = prisonerDetail

    if (ethnicity && ethnicityCode) return `${prisonerDetail?.ethnicity} (${prisonerDetail.ethnicityCode})`
    if (ethnicity) return prisonerDetail?.ethnicity
    return null
  }

  private getPersonalDetails(
    prisonerData: Prisoner,
    inmateDetail: InmateDetail,
    prisonerDetail: PrisonerDetail,
  ): OverviewPage['personalDetails'] {
    return {
      personalDetailsMain: {
        preferredName: prisonerData.firstName ? `${convertToTitleCase(prisonerData.firstName)}` : null,
        dateOfBirth: prisonerData.dateOfBirth ? formatDate(prisonerData.dateOfBirth, 'short') : null,
        age: prisonerData.dateOfBirth ? calculateAge(prisonerData.dateOfBirth) : null,
        nationality: prisonerData.nationality,
        spokenLanguage: inmateDetail.language,
      },
      personalDetailsSide: {
        ethnicGroup: this.getEthnicGroupText(prisonerDetail),
        religionOrBelief: prisonerData.religion,
        croNumber: prisonerData.croNumber,
        pncNumber: prisonerData.pncNumber,
      },
    }
  }

  private getNonAssociationSummary(
    prisonerNonAssociations: PrisonerNonAssociations,
  ): OverviewPage['nonAssociationSummary'] {
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
    }
  }

  private getStatuses(
    prisonerData: Prisoner,
    inmateDetail: InmateDetail,
    learnerNeurodivergence: Result<LearnerNeurodivergence[]>,
    scheduledTransfers: PrisonerPrisonSchedule[],
  ): OverviewPage['statuses'] {
    return [
      this.getLocationStatus(prisonerData),
      this.getListenerStatus(inmateDetail),
      this.getNeurodiversitySupportStatus(learnerNeurodivergence),
      this.getScheduledTransferStatus(scheduledTransfers),
    ].filter(Boolean)
  }

  private getLocationStatus(prisonerData: Prisoner): OverviewPage['statuses'][number] {
    if (prisonerData.inOutStatus === 'IN') {
      return { label: `In ${prisonerData.prisonName}` }
    }
    if (prisonerData.status === 'ACTIVE OUT') {
      return { label: `Out from ${prisonerData.prisonName}` }
    }
    if (prisonerData.status === 'INACTIVE OUT') {
      return { label: prisonerData.locationDescription }
    }
    if (prisonerData.inOutStatus === 'TRN') {
      return { label: 'Being transferred' }
    }
    return null
  }

  private getListenerStatus(inmateDetail: InmateDetail): OverviewPage['statuses'][number] {
    const recognised = getProfileInformationValue(
      ProfileInformationType.RecognisedListener,
      inmateDetail.profileInformation,
    )
    const suitable = getProfileInformationValue(
      ProfileInformationType.SuitableListener,
      inmateDetail.profileInformation,
    )

    if (recognised === BooleanString.Yes) {
      return { label: 'Recognised Listener' }
    }

    if (suitable === BooleanString.Yes) {
      return { label: 'Suitable Listener' }
    }

    return null
  }

  private getNeurodiversitySupportStatus(
    learnerNeurodivergence: Result<LearnerNeurodivergence[]>,
  ): OverviewPage['statuses'][number] {
    const supportNeededStatus = { label: 'Support needed', subText: 'Has neurodiversity needs' }
    const supportNeededErrorStatus = { label: 'Support needs unavailable', subText: 'Try again later', error: true }
    return learnerNeurodivergence.handle({
      fulfilled: it => it?.length && supportNeededStatus,
      rejected: () => supportNeededErrorStatus,
    })
  }

  private getScheduledTransferStatus(scheduledTransfers: PrisonerPrisonSchedule[]): OverviewPage['statuses'][number] {
    return (
      scheduledTransfers?.length > 0 && {
        label: 'Scheduled transfer',
        subText: `To ${scheduledTransfers[0].eventLocation}`,
      }
    )
  }
}
