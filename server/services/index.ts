import { SQSClient } from '@aws-sdk/client-sqs'
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { PermissionsService as PrisonPermissionsService } from '@ministryofjustice/hmpps-prison-permissions-lib'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { OsPlacesAddressService } from '@ministryofjustice/hmpps-connect-dps-shared-items'
import { dataAccess } from '../data'
import CommonApiRoutes from '../routes/common/api'
import AlertsService from './alertsService'
import CaseNotesService from './caseNotesService'
import OffencesPageService from './offencesPageService'
import OffenderService from './offenderService'
import PersonalPageService from './personalPageService'
import PrisonerSearchService from './prisonerSearch'
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
import MetricsService from './metrics/metricsService'
import DistinguishingMarksService from './distinguishingMarksService'
import CsipService from './csipService'
import ReferenceDataService from './referenceData/referenceDataService'
import MilitaryRecordsService from './militaryRecordsService'
import { ReferenceDataSourceFactory } from './referenceData/referenceDataSourceFactory'
import PhotoService from './photoService'
import AliasService from './aliasService'
import LanguagesService from './languagesService'
import ContactsService from './contactsService'
import NextOfKinService from './nextOfKinService'
import DomesticStatusService from './domesticStatusService'
import logger from '../../logger'
import EphemeralDataService from './ephemeralDataService'
import GlobalPhoneNumberAndEmailAddressesService from './globalPhoneNumberAndEmailAddressesService'
import IdentityNumbersService from './identityNumbersService'

export const services = () => {
  const {
    prisonApiClientBuilder,
    locationsInsidePrisonApiClientBuilder,
    nomisSyncPrisonMappingClientBuilder,
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
    bookAVideoLinkApiClientBuilder,
    complexityApiClientBuilder,
    calculateReleaseDatesApiClientBuilder,
    prisonRegisterApiClientBuilder,
    alertsApiClientBuilder,
    personIntegrationApiClientBuilder,
    csipApiClientBuilder,
    healthAndMedicationApiClientBuilder,
    personCommunicationNeedsApiClientBuilder,
    personalRelationshipsApiClientBuilder,
    prisonRegisterStore,
    referenceDataStore,
    featureToggleStore,
    ephemeralDataStore,
    telemetryClient,
    osPlacesApiClient,
    curiousApiToken,
    tokenStore,
  } = dataAccess

  const auditService = AuditService({
    sqsClient: new SQSClient({ region: config.apis.audit.region }),
    queueUrl: config.apis.audit.queueUrl,
    serviceName: config.apis.audit.serviceName,
    build: config.gitRef,
    enabled: config.apis.audit.enabled,
  })

  const prisonPermissionsService = PrisonPermissionsService.create({
    prisonerSearchConfig: config.apis.prisonerSearchApi,
    authenticationClient: new AuthenticationClient(config.apis.hmppsAuth, logger, tokenStore),
    logger,
    telemetryClient,
  })

  const metricsService = new MetricsService(telemetryClient)
  const featureToggleService = new FeatureToggleService(featureToggleStore)
  const ephemeralDataService = new EphemeralDataService(ephemeralDataStore)
  const personalLearningPlansService = PersonalLearningPlanServiceFactory.getInstance(dataAccess)
  const offenderService = new OffenderService(prisonApiClientBuilder, nonAssociationsApiClientBuilder)
  const caseNotesService = new CaseNotesService(caseNotesApiClientBuilder)
  const prisonerSearchService = new PrisonerSearchService(prisonerSearchApiClientBuilder)
  const alertsService = new AlertsService(alertsApiClientBuilder)
  const offencesPageService = new OffencesPageService(prisonApiClientBuilder)
  const offencesService = new OffencesService(prisonApiClientBuilder, calculateReleaseDatesApiClientBuilder)
  const referenceDataSourceFactory = new ReferenceDataSourceFactory(
    personIntegrationApiClientBuilder,
    healthAndMedicationApiClientBuilder,
    personCommunicationNeedsApiClientBuilder,
    personalRelationshipsApiClientBuilder,
  )
  const referenceDataService = new ReferenceDataService(referenceDataStore, referenceDataSourceFactory)
  const prisonService = new PrisonService(prisonRegisterStore, prisonRegisterApiClientBuilder)
  const curiousService = new CuriousService(curiousApiClientBuilder, prisonService, curiousApiToken)
  const workAndSkillsPageService = new WorkAndSkillsPageService(
    curiousApiClientBuilder,
    prisonApiClientBuilder,
    personalLearningPlansService,
    curiousApiToken,
  )
  const locationDetailsService = new LocationDetailsService(
    prisonApiClientBuilder,
    nomisSyncPrisonMappingClientBuilder,
    locationsInsidePrisonApiClientBuilder,
  )
  const csraService = new CsraService(prisonApiClientBuilder)
  const moneyService = new MoneyService(prisonApiClientBuilder)
  const appointmentService = new AppointmentService(
    locationDetailsService,
    prisonApiClientBuilder,
    whereaboutsApiClientBuilder,
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
  const osPlacesAddressService = new OsPlacesAddressService(logger, osPlacesApiClient)
  const addressService = new AddressService(
    metricsService,
    referenceDataService,
    osPlacesAddressService,
    prisonApiClientBuilder,
    personIntegrationApiClientBuilder,
  )
  const prisonerLocationHistoryService = new PrisonerLocationHistoryService(
    prisonApiClientBuilder,
    whereaboutsApiClientBuilder,
    caseNotesApiClientBuilder,
    locationsInsidePrisonApiClientBuilder,
    nomisSyncPrisonMappingClientBuilder,
  )
  const adjudicationsService = new AdjudicationsService(adjudicationsApiClientBuilder)
  const prisonerScheduleService = new PrisonerScheduleService(prisonApiClientBuilder)
  const incentivesService = new IncentivesService(caseNotesApiClientBuilder, incentivesApiClientBuilder)
  const careNeedsService = new CareNeedsService(prisonApiClientBuilder)
  const distinguishingMarksService = new DistinguishingMarksService(personIntegrationApiClientBuilder)
  const csipService = new CsipService(csipApiClientBuilder)
  const militaryRecordsService = new MilitaryRecordsService(
    personIntegrationApiClientBuilder,
    referenceDataService,
    metricsService,
  )
  const photoService = new PhotoService(prisonApiClientBuilder)
  const aliasService = new AliasService(personIntegrationApiClientBuilder, metricsService)
  const commonApiRoutes = new CommonApiRoutes(offenderService, auditService, distinguishingMarksService, photoService)
  const languagesService = new LanguagesService(
    personCommunicationNeedsApiClientBuilder,
    referenceDataService,
    metricsService,
  )
  const contactsService = new ContactsService(personalRelationshipsApiClientBuilder)
  const nextOfKinService = new NextOfKinService(
    personalRelationshipsApiClientBuilder,
    referenceDataService,
    metricsService,
  )
  const domesticStatusService = new DomesticStatusService(
    personalRelationshipsApiClientBuilder,
    referenceDataService,
    metricsService,
  )
  const globalPhoneNumberAndEmailAddressesService = new GlobalPhoneNumberAndEmailAddressesService(
    personIntegrationApiClientBuilder,
    referenceDataService,
  )

  const identityNumbersService = new IdentityNumbersService(
    prisonApiClientBuilder,
    personIntegrationApiClientBuilder,
    metricsService,
  )
  const personalPageService = new PersonalPageService(
    prisonApiClientBuilder,
    curiousApiClientBuilder,
    personIntegrationApiClientBuilder,
    healthAndMedicationApiClientBuilder,
    personalRelationshipsApiClientBuilder,
    referenceDataService,
    prisonService,
    metricsService,
    curiousApiToken,
    nextOfKinService,
    domesticStatusService,
    globalPhoneNumberAndEmailAddressesService,
    addressService,
  )

  const apolloClient = new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: `${config.apis.contentful.host}/content/v1/spaces/${config.apis.contentful.spaceId}/environments/${config.apis.contentful.environment}`,
      headers: {
        Authorization: `Bearer ${config.apis.contentful.accessToken}`,
      },
    }),
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
    locationDetailsService,
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
    ephemeralDataService,
    careNeedsService,
    distinguishingMarksService,
    csipService,
    militaryRecordsService,
    photoService,
    aliasService,
    languagesService,
    referenceDataService,
    contactsService,
    nextOfKinService,
    prisonPermissionsService,
    identityNumbersService,
    metricsService,
  }
}

export type Services = ReturnType<typeof services>

export { PrisonerSearchService, CommonApiRoutes }
