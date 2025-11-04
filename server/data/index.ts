/* eslint-disable import/order */
/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import { buildAppInsightsClient, initialiseAppInsights } from '../utils/azureAppInsights'
import { OsPlacesApiClient } from '@ministryofjustice/hmpps-connect-dps-shared-items'
import AllocationManagerApiClient from './allocationManagerApiClient'
import CaseNotesApiRestClient from './caseNotesApiClient'
import CuriousRestApiClient from './curiousApiClient'
import { CuriousApiToken, curiousApiTokenBuilder, systemTokenBuilder } from './hmppsAuthClient'
import IncentivesApiRestClient from './incentivesApiClient'
import KeyWorkerRestClient from './keyWorkerApiClient'
import ManageSocCasesApiRestClient from './manageSocCasesApiClient'
import PathfinderApiRestClient from './pathfinderApiClient'
import PrisonApiRestClient from './prisonApiClient'
import LocationsInsidePrisonApiRestClient from './locationsInsidePrisonApiClient'
import NomisSyncPrisonMappingRestClient from './nomisSyncPrisonerMappingClient'
import PrisonerSearchClient from './prisonerSearchClient'

import { createRedisClient } from './redisClient'
import AdjudicationsApiRestClient from './adjudicationsApiClient'
import NonAssociationsApiRestClient from './nonAssociationsApiClient'
import WhereaboutsRestApiClient from './whereaboutsClient'
import PrisonerProfileDeliusApiRestClient from './prisonerProfileDeliusApiClient'
import ComplexityApiRestClient from './complexityApiClient'
import applicationInfo from '../applicationInfo'
import EducationAndWorkPlanApiRestClient from './educationAndWorkPlanApiClient'
import RestrictedPatientApiRestClient from './restrictedPatientApiClient'
import PrisonRegisterStore from './prisonRegisterStore/prisonRegisterStore'
import CalculateReleaseDatesApiClient from './calculateReleaseDatesApiClient'
import PrisonRegisterApiRestClient from './prisonRegisterApiClient'
import config from '../config'
import RedisTokenStore from './tokenStore/redisTokenStore'
import InMemoryTokenStore from './tokenStore/inMemoryTokenStore'
import AlertsApiRestClient from './alertsApiClient'
import RedisFeatureToggleStore from './featureToggleStore/redisFeatureToggleStore'
import InMemoryFeatureToggleStore from './featureToggleStore/inMemoryFeatureToggleStore'
import BookAVideoLinkRestApiClient from './bookAVideoLinkApiClient'
import CsipApiRestClient from './csipApiClient'
import PersonIntegrationApiRestClient from './personIntegrationApiClient'
import ReferenceDataStore from './referenceDataStore/referenceDataStore'
import HealthAndMedicationApiRestClient from './healthAndMedicationApiRestClient'
import PersonCommunicationNeedsApiRestClient from './personCommunicationNeedsApiRestClient'
import PrisonerProfileApiRestClient from './prisonerProfileApiClient'
import PersonalRelationshipsApiRestClient from './personalRelationshipsApiRestClient'
import { EphemeralDataStore } from './ephemeralDataStore/ephemeralDataStore'
import logger from '../../logger'
import { circuitBreakerBuilder } from './restClient'
import { ApiConfig } from '@ministryofjustice/hmpps-rest-client'

initialiseAppInsights()
const telemetryClient = buildAppInsightsClient(applicationInfo())

type RestClientBuilder<T> = (token: string) => T
type CuriousRestClientBuilder<T> = (token: CuriousApiToken) => T

const tokenStore = config.redis.enabled ? new RedisTokenStore(createRedisClient()) : new InMemoryTokenStore()

const circuitBreakers = {
  allocationManager: circuitBreakerBuilder('allocationManager', config.apis.allocationManager),
  caseNotes: circuitBreakerBuilder('caseNotesApi', config.apis.caseNotesApi),
  curious: circuitBreakerBuilder('curiousApiUrl', config.apis.curiousApiUrl),
  incentives: circuitBreakerBuilder('incentivesApi', config.apis.incentivesApi),
  keyworker: circuitBreakerBuilder('keyworker', config.apis.keyworker),
  manageSocCases: circuitBreakerBuilder('manageSocCasesApi', config.apis.manageSocCasesApi),
  pathfinder: circuitBreakerBuilder('pathfinderApi', config.apis.pathfinderApi),
  adjudications: circuitBreakerBuilder('adjudicationsApi', config.apis.adjudicationsApi),
  prisonApi: circuitBreakerBuilder('prisonApi', config.apis.prisonApi),
  locationsInsidePrison: circuitBreakerBuilder('locationsInsidePrisonApi', config.apis.locationsInsidePrisonApi),
  nomisSyncPrisonMapping: circuitBreakerBuilder('nomisSyncPrisonerMappingApi', config.apis.nomisSyncPrisonerMappingApi),
  prisonerSearch: circuitBreakerBuilder('prisonerSearchApi', config.apis.prisonerSearchApi),
  nonAssociations: circuitBreakerBuilder('nonAssociationsApi', config.apis.nonAssociationsApi),
  whereabouts: circuitBreakerBuilder('whereaboutsApi', config.apis.whereaboutsApi),
  bookAVideoLink: circuitBreakerBuilder('bookAVideoLinkApi', config.apis.bookAVideoLinkApi),
  prisonerProfileDelius: circuitBreakerBuilder('prisonerProfileDeliusApi', config.apis.prisonerProfileDeliusApi),
  complexity: circuitBreakerBuilder('complexityApi', config.apis.complexityApi),
  educationAndWorkPlan: circuitBreakerBuilder('educationAndWorkPlanApi', config.apis.educationAndWorkPlanApi),
  restrictedPatient: circuitBreakerBuilder('restrictedPatientApi', config.apis.restrictedPatientApi),
  prisonRegister: circuitBreakerBuilder('prisonRegisterApi', config.apis.prisonRegisterApi),
  calculateReleaseDates: circuitBreakerBuilder('calculateReleaseDatesApi', config.apis.calculateReleaseDatesApi),
  alerts: circuitBreakerBuilder('alertsApi', config.apis.alertsApi),
  personIntegration: circuitBreakerBuilder('personIntegrationApi', config.apis.personIntegrationApi),
  csip: circuitBreakerBuilder('csipApi', config.apis.csipApi),
  healthAndMedication: circuitBreakerBuilder('healthAndMedicationApi', config.apis.healthAndMedicationApi),
  personCommunicationNeeds: circuitBreakerBuilder(
    'personCommunicationNeedsApi',
    config.apis.personCommunicationNeedsApi,
  ),
  prisonerProfile: circuitBreakerBuilder('prisonerProfile', {} as ApiConfig),
  personalRelationships: circuitBreakerBuilder('personalRelationshipsApi', config.apis.personalRelationshipsApi),
}

export const dataAccess = {
  applicationInfo: applicationInfo(),
  allocationManagerApiClientBuilder: (token: string) =>
    new AllocationManagerApiClient(token, circuitBreakers.allocationManager),
  caseNotesApiClientBuilder: (token: string) => new CaseNotesApiRestClient(token, circuitBreakers.caseNotes),
  curiousApiClientBuilder: (token: CuriousApiToken) => new CuriousRestApiClient(token, circuitBreakers.curious),
  incentivesApiClientBuilder: (token: string) => new IncentivesApiRestClient(token, circuitBreakers.incentives),
  keyworkerApiClientBuilder: (token: string) => new KeyWorkerRestClient(token, circuitBreakers.keyworker),
  manageSocCasesApiClientBuilder: (token: string) =>
    new ManageSocCasesApiRestClient(token, circuitBreakers.manageSocCases),
  pathfinderApiClientBuilder: (token: string) => new PathfinderApiRestClient(token, circuitBreakers.pathfinder),
  adjudicationsApiClientBuilder: (token: string) =>
    new AdjudicationsApiRestClient(token, circuitBreakers.adjudications),
  prisonApiClientBuilder: (token: string) => new PrisonApiRestClient(token, circuitBreakers.prisonApi),
  locationsInsidePrisonApiClientBuilder: (token: string) =>
    new LocationsInsidePrisonApiRestClient(token, circuitBreakers.locationsInsidePrison),
  nomisSyncPrisonMappingClientBuilder: (token: string) =>
    new NomisSyncPrisonMappingRestClient(token, circuitBreakers.nomisSyncPrisonMapping),
  prisonerSearchApiClientBuilder: (token: string) => new PrisonerSearchClient(token, circuitBreakers.prisonerSearch),
  systemToken: systemTokenBuilder(tokenStore),
  curiousApiToken: curiousApiTokenBuilder(tokenStore),
  nonAssociationsApiClientBuilder: (token: string) =>
    new NonAssociationsApiRestClient(token, circuitBreakers.nonAssociations),
  whereaboutsApiClientBuilder: (token: string) => new WhereaboutsRestApiClient(token, circuitBreakers.whereabouts),
  bookAVideoLinkApiClientBuilder: (token: string) =>
    new BookAVideoLinkRestApiClient(token, circuitBreakers.bookAVideoLink),
  prisonerProfileDeliusApiClientBuilder: (token: string) =>
    new PrisonerProfileDeliusApiRestClient(token, circuitBreakers.prisonerProfileDelius),
  complexityApiClientBuilder: (token: string) => new ComplexityApiRestClient(token, circuitBreakers.complexity),
  educationAndWorkPlanApiClientBuilder: (token: string) =>
    new EducationAndWorkPlanApiRestClient(token, circuitBreakers.educationAndWorkPlan),
  restrictedPatientApiClientBuilder: (token: string) =>
    new RestrictedPatientApiRestClient(token, circuitBreakers.restrictedPatient),
  prisonRegisterApiClientBuilder: (token: string) =>
    new PrisonRegisterApiRestClient(token, circuitBreakers.prisonRegister),
  prisonRegisterStore: new PrisonRegisterStore(createRedisClient()),
  referenceDataStore: new ReferenceDataStore(createRedisClient()),
  calculateReleaseDatesApiClientBuilder: (token: string) =>
    new CalculateReleaseDatesApiClient(token, circuitBreakers.calculateReleaseDates),
  alertsApiClientBuilder: (token: string) => new AlertsApiRestClient(token, circuitBreakers.alerts),
  featureToggleStore: config.redis.enabled
    ? new RedisFeatureToggleStore(createRedisClient())
    : new InMemoryFeatureToggleStore(),
  ephemeralDataStore: new EphemeralDataStore(createRedisClient()),
  personIntegrationApiClientBuilder: (token: string) =>
    new PersonIntegrationApiRestClient(token, circuitBreakers.personIntegration),
  csipApiClientBuilder: (token: string) => new CsipApiRestClient(token, circuitBreakers.csip),
  healthAndMedicationApiClientBuilder: (token: string) =>
    new HealthAndMedicationApiRestClient(token, circuitBreakers.healthAndMedication),
  telemetryClient,
  osPlacesApiClient: new OsPlacesApiClient(logger, config.apis.osPlacesApi),
  personCommunicationNeedsApiClientBuilder: (token: string) =>
    new PersonCommunicationNeedsApiRestClient(token, circuitBreakers.personCommunicationNeeds),
  prisonerProfileApiClientBuilder: (token: string) =>
    new PrisonerProfileApiRestClient(token, circuitBreakers.prisonerProfile),
  personalRelationshipsApiClientBuilder: (token: string) =>
    new PersonalRelationshipsApiRestClient(token, circuitBreakers.personalRelationships),
  tokenStore,
}

export type DataAccess = typeof dataAccess

export type { RestClientBuilder, CuriousRestClientBuilder }
