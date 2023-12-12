import { SQSClient } from '@aws-sdk/client-sqs'
import { dataAccess } from '../data'
import CommonApiRoutes from '../routes/common/api'
import ActivePunishmentsService from './activePunishmentsService'
import AlertsPageService from './alertsPageService'
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
import prisonerLocationHistoryService from './prisonerLocationHistoryService'
import ProfessionalContactsService from './professionalContactsService'
import { auditService as AuditService } from './auditService'
import config from '../config'
import { getBuild } from './healthCheck'

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
  } = dataAccess

  const auditService = AuditService({
    sqsClient: new SQSClient({ region: config.apis.audit.region }),
    queueUrl: config.apis.audit.queueUrl,
    serviceName: config.apis.audit.serviceName,
    build: getBuild()?.build?.gitRef,
    enabled: config.apis.audit.enabled,
  })

  const userService = new UserService(hmppsAuthClientBuilder, prisonApiClientBuilder)
  const offenderService = new OffenderService(prisonApiClientBuilder)
  const commonApiRoutes = new CommonApiRoutes(offenderService, auditService)
  const caseNotesService = new CaseNotesService(caseNotesApiClientBuilder)
  const prisonerSearchService = new PrisonerSearchService(prisonerSearchApiClientBuilder)
  const alertsPageService = new AlertsPageService(prisonApiClientBuilder)
  const offencesPageService = new OffencesPageService(prisonApiClientBuilder)
  const overviewPageService = new OverviewPageService(
    prisonApiClientBuilder,
    allocationManagerApiClientBuilder,
    keyworkerApiClientBuilder,
    incentivesApiClientBuilder,
    adjudicationsApiClientBuilder,
    offencesPageService,
    curiousApiClientBuilder,
    nonAssociationsApiClientBuilder,
    prisonerProfileDeliusApiClientBuilder,
  )
  const personalPageService = new PersonalPageService(prisonApiClientBuilder, curiousApiClientBuilder)
  const workAndSkillsPageService = new WorkAndSkillsPageService(curiousApiClientBuilder, prisonApiClientBuilder)
  const activePunishmentsPageService = new ActivePunishmentsService(adjudicationsApiClientBuilder)
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

  return {
    dataAccess,
    commonApiRoutes,
    offenderService,
    userService,
    caseNotesService,
    prisonerSearchService,
    alertsPageService,
    overviewPageService,
    personalPageService,
    workAndSkillsPageService,
    activePunishmentsPageService,
    offencesPageService,
    referenceDataService,
    componentService,
    csraService,
    moneyService,
    appointmentService,
    prisonerLocationHistoryService: prisonerLocationHistoryService({
      prisonApiClientBuilder,
      whereaboutsApiClientBuilder,
      caseNotesApiClientBuilder,
    }),
    professionalContactsService,
    auditService,
  }
}

export type Services = ReturnType<typeof services>

export { UserService, PrisonerSearchService, CommonApiRoutes }
