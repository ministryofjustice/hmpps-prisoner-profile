import { SQSClient } from '@aws-sdk/client-sqs'
import { dataAccess } from '../data'
import CommonApiRoutes from '../routes/common/api'
import AlertsService from './alertsService'
import CaseNotesService from './caseNotesService'
import OffencesPageService from './offencesPageService'
import OffenderService from './offenderService'
import OverviewPageService from './overviewPageService'
import PersonalPageService from './personalPageService'
import PrisonerSearchService from './prisonerSearch'
import UserService from './userService'
import WorkAndSkillsPageService from './workAndSkillsPageService'
import ReferenceDataService from './referenceDataService'
import CsraService from './csraService'
import ComponentService from './componentService'
import MoneyService from './moneyService'
import AppointmentService from './appointmentService'
import PrisonerLocationHistoryService from './prisonerLocationHistoryService'
import ProfessionalContactsService from './professionalContactsService'
import { auditService as AuditService } from './auditService'
import config from '../config'
import BeliefService from './beliefService'
import LocationDetailsService from './locationDetailsService'
import PersonalLearningPlanServiceFactory from './personalLearningPlanServiceFactory'
import ProbationDocumentsService from './probationDocumentsService'
import OffencesService from './offencesService'
import { VisitsService } from './visitsService'
import AddressService from './addressService'
import PrisonService from './prisonService'

export const services = () => {
  const {
    hmppsAuthClientBuilder,
    prisonApiClientBuilder,
    caseNotesApiClientBuilder,
    prisonerSearchApiClientBuilder,
    allocationManagerApiClientBuilder,
    keyworkerApiClientBuilder,
    incentivesApiClientBuilder,
    curiousApiClientBuilder,
    adjudicationsApiClientBuilder,
    nonAssociationsApiClientBuilder,
    componentApiClientBuilder,
    whereaboutsApiClientBuilder,
    prisonerProfileDeliusApiClientBuilder,
    manageUsersApiClientBuilder,
    complexityApiClientBuilder,
    calculateReleaseDatesApiClientBuilder,
    prisonRegisterApiClientBuilder,
    prisonRegisterStore,
  } = dataAccess

  const auditService = AuditService({
    sqsClient: new SQSClient({ region: config.apis.audit.region }),
    queueUrl: config.apis.audit.queueUrl,
    serviceName: config.apis.audit.serviceName,
    build: config.gitRef,
    enabled: config.apis.audit.enabled,
  })

  const personalLearningPlansService = PersonalLearningPlanServiceFactory.getInstance(dataAccess)
  const userService = new UserService(hmppsAuthClientBuilder, prisonApiClientBuilder)
  const offenderService = new OffenderService(prisonApiClientBuilder)
  const commonApiRoutes = new CommonApiRoutes(offenderService, auditService)
  const caseNotesService = new CaseNotesService(caseNotesApiClientBuilder)
  const prisonerSearchService = new PrisonerSearchService(prisonerSearchApiClientBuilder)
  const alertsService = new AlertsService(prisonApiClientBuilder)
  const offencesPageService = new OffencesPageService(prisonApiClientBuilder)
  const offencesService = new OffencesService(prisonApiClientBuilder, calculateReleaseDatesApiClientBuilder)
  const overviewPageService = new OverviewPageService(
    prisonApiClientBuilder,
    allocationManagerApiClientBuilder,
    keyworkerApiClientBuilder,
    incentivesApiClientBuilder,
    adjudicationsApiClientBuilder,
    curiousApiClientBuilder,
    nonAssociationsApiClientBuilder,
    prisonerProfileDeliusApiClientBuilder,
    complexityApiClientBuilder,
  )
  const personalPageService = new PersonalPageService(prisonApiClientBuilder, curiousApiClientBuilder)
  const workAndSkillsPageService = new WorkAndSkillsPageService(
    curiousApiClientBuilder,
    prisonApiClientBuilder,
    personalLearningPlansService,
  )
  const prisonerLocationDetailsPageService = new LocationDetailsService(prisonApiClientBuilder)
  const referenceDataService = new ReferenceDataService(prisonApiClientBuilder)
  const componentService = new ComponentService(componentApiClientBuilder)
  const csraService = new CsraService(prisonApiClientBuilder)
  const moneyService = new MoneyService(prisonApiClientBuilder)
  const appointmentService = new AppointmentService(
    prisonApiClientBuilder,
    whereaboutsApiClientBuilder,
    manageUsersApiClientBuilder,
  )
  const professionalContactsService = new ProfessionalContactsService(
    prisonApiClientBuilder,
    allocationManagerApiClientBuilder,
    prisonerProfileDeliusApiClientBuilder,
    keyworkerApiClientBuilder,
  )
  const beliefService = new BeliefService(prisonApiClientBuilder)
  const probationDocumentsService = new ProbationDocumentsService(prisonerProfileDeliusApiClientBuilder)
  const visitsService = new VisitsService(prisonApiClientBuilder)
  const addressService = new AddressService(prisonApiClientBuilder)
  const prisonerLocationHistoryService = new PrisonerLocationHistoryService(
    prisonApiClientBuilder,
    whereaboutsApiClientBuilder,
    caseNotesApiClientBuilder,
  )
  const prisonService = new PrisonService(prisonRegisterStore, prisonRegisterApiClientBuilder)

  return {
    dataAccess,
    commonApiRoutes,
    offenderService,
    userService,
    caseNotesService,
    prisonerSearchService,
    alertsService,
    overviewPageService,
    personalPageService,
    workAndSkillsPageService,
    personalLearningPlansService,
    offencesPageService,
    referenceDataService,
    componentService,
    csraService,
    moneyService,
    appointmentService,
    prisonerLocationDetailsPageService,
    prisonerLocationHistoryService,
    professionalContactsService,
    beliefService,
    auditService,
    probationDocumentsService,
    offencesService,
    visitsService,
    addressService,
    prisonService,
  }
}

export type Services = ReturnType<typeof services>

export { UserService, PrisonerSearchService, CommonApiRoutes }
