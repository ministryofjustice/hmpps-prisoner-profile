import { SQSClient } from '@aws-sdk/client-sqs'
import { ApolloClient, InMemoryCache } from '@apollo/client/core'
import { dataAccess } from '../data'
import CommonApiRoutes from '../routes/common/api'
import AlertsService from './alertsService'
import CaseNotesService from './caseNotesService'
import OffencesPageService from './offencesPageService'
import OffenderService from './offenderService'
import PersonalPageService from './personalPageService'
import PrisonerSearchService from './prisonerSearch'
import UserService from './userService'
import WorkAndSkillsPageService from './workAndSkillsPageService'
import CsraService from './csraService'
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
import AdjudicationsService from './adjudicationsService'
import PrisonerScheduleService from './prisonerScheduleService'
import IncentivesService from './incentivesService'
import ContentfulService from './contentfulService'
import CuriousService from './curiousService'
import FeatureToggleService from './featureToggleService'
import CareNeedsService from './careNeedsService'
import PermissionsService from './permissionsService'
import PrisonPersonService from './prisonPersonService'
import MetricsService from './metrics/metricsService'

export const services = () => {
  const {
    prisonApiClientBuilder,
    caseNotesApiClientBuilder,
    prisonerSearchApiClientBuilder,
    allocationManagerApiClientBuilder,
    keyworkerApiClientBuilder,
    incentivesApiClientBuilder,
    curiousApiClientBuilder,
    adjudicationsApiClientBuilder,
    nonAssociationsApiClientBuilder,
    whereaboutsApiClientBuilder,
    prisonerProfileDeliusApiClientBuilder,
    manageUsersApiClientBuilder,
    bookAVideoLinkApiClientBuilder,
    complexityApiClientBuilder,
    calculateReleaseDatesApiClientBuilder,
    prisonRegisterApiClientBuilder,
    alertsApiClientBuilder,
    prisonPersonApiClientBuilder,
    prisonRegisterStore,
    featureToggleStore,
    telemetryClient,
  } = dataAccess

  const auditService = AuditService({
    sqsClient: new SQSClient({ region: config.apis.audit.region }),
    queueUrl: config.apis.audit.queueUrl,
    serviceName: config.apis.audit.serviceName,
    build: config.gitRef,
    enabled: config.apis.audit.enabled,
  })

  const metricsService = new MetricsService(telemetryClient)
  const featureToggleService = new FeatureToggleService(featureToggleStore)
  const personalLearningPlansService = PersonalLearningPlanServiceFactory.getInstance(dataAccess)
  const userService = new UserService(prisonApiClientBuilder)
  const offenderService = new OffenderService(prisonApiClientBuilder, nonAssociationsApiClientBuilder)
  const caseNotesService = new CaseNotesService(caseNotesApiClientBuilder)
  const prisonerSearchService = new PrisonerSearchService(prisonerSearchApiClientBuilder)
  const alertsService = new AlertsService(prisonApiClientBuilder, alertsApiClientBuilder, featureToggleService)
  const offencesPageService = new OffencesPageService(prisonApiClientBuilder)
  const offencesService = new OffencesService(prisonApiClientBuilder, calculateReleaseDatesApiClientBuilder)
  const personalPageService = new PersonalPageService(
    prisonApiClientBuilder,
    curiousApiClientBuilder,
    prisonPersonApiClientBuilder,
    metricsService,
  )
  const prisonService = new PrisonService(prisonRegisterStore, prisonRegisterApiClientBuilder)
  const curiousService = new CuriousService(curiousApiClientBuilder, prisonService)
  const workAndSkillsPageService = new WorkAndSkillsPageService(
    curiousApiClientBuilder,
    prisonApiClientBuilder,
    personalLearningPlansService,
  )
  const prisonerLocationDetailsPageService = new LocationDetailsService(prisonApiClientBuilder)
  const csraService = new CsraService(prisonApiClientBuilder)
  const moneyService = new MoneyService(prisonApiClientBuilder)
  const appointmentService = new AppointmentService(
    prisonApiClientBuilder,
    whereaboutsApiClientBuilder,
    manageUsersApiClientBuilder,
    bookAVideoLinkApiClientBuilder,
  )
  const professionalContactsService = new ProfessionalContactsService(
    prisonApiClientBuilder,
    allocationManagerApiClientBuilder,
    prisonerProfileDeliusApiClientBuilder,
    keyworkerApiClientBuilder,
    complexityApiClientBuilder,
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
  const adjudicationsService = new AdjudicationsService(adjudicationsApiClientBuilder)
  const prisonerScheduleService = new PrisonerScheduleService(prisonApiClientBuilder)
  const incentivesService = new IncentivesService(incentivesApiClientBuilder, prisonApiClientBuilder)
  const careNeedsService = new CareNeedsService(prisonApiClientBuilder)
  const permissionsService = new PermissionsService(userService)
  const prisonPersonService = new PrisonPersonService(prisonPersonApiClientBuilder)
  const commonApiRoutes = new CommonApiRoutes(offenderService, auditService, prisonPersonService)

  const apolloClient = new ApolloClient({
    cache: new InMemoryCache(),
    uri: `${config.apis.contentful.host}/content/v1/spaces/${config.apis.contentful.spaceId}/environments/master`,
    headers: {
      Authorization: `Bearer ${config.apis.contentful.accessToken}`,
    },
    ssrMode: true,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
      },
    },
  })
  const contentfulService = new ContentfulService(apolloClient)

  return {
    dataAccess,
    commonApiRoutes,
    offenderService,
    userService,
    caseNotesService,
    prisonerSearchService,
    alertsService,
    personalPageService,
    workAndSkillsPageService,
    personalLearningPlansService,
    offencesPageService,
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
    adjudicationsService,
    prisonerScheduleService,
    incentivesService,
    contentfulService,
    curiousService,
    featureToggleService,
    careNeedsService,
    permissionsService,
    prisonPersonService,
  }
}

export type Services = ReturnType<typeof services>

export { UserService, PrisonerSearchService, CommonApiRoutes }
