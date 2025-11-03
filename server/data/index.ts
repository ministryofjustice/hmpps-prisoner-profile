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
  allocationManager: circuitBreakerBuilder(config.apis.allocationManager),
  caseNotes: circuitBreakerBuilder(config.apis.caseNotesApi),
  curious: circuitBreakerBuilder(config.apis.curiousApiUrl),
  incentives: circuitBreakerBuilder(config.apis.incentivesApi),
  keyworker: circuitBreakerBuilder(config.apis.keyworker),
  manageSocCases: circuitBreakerBuilder(config.apis.manageSocCasesApi),
  pathfinder: circuitBreakerBuilder(config.apis.pathfinderApi),
  adjudications: circuitBreakerBuilder(config.apis.adjudicationsApi),
  prisonApi: circuitBreakerBuilder(config.apis.prisonApi),
  locationsInsidePrison: circuitBreakerBuilder(config.apis.locationsInsidePrisonApi),
  nomisSyncPrisonMapping: circuitBreakerBuilder(config.apis.nomisSyncPrisonerMappingApi),
  prisonerSearch: circuitBreakerBuilder(config.apis.prisonerSearchApi),
  nonAssociations: circuitBreakerBuilder(config.apis.nonAssociationsApi),
  whereabouts: circuitBreakerBuilder(config.apis.whereaboutsApi),
  bookAVideoLink: circuitBreakerBuilder(config.apis.bookAVideoLinkApi),
  prisonerProfileDelius: circuitBreakerBuilder(config.apis.prisonerProfileDeliusApi),
  complexity: circuitBreakerBuilder(config.apis.complexityApi),
  educationAndWorkPlan: circuitBreakerBuilder(config.apis.educationAndWorkPlanApi),
  restrictedPatient: circuitBreakerBuilder(config.apis.restrictedPatientApi),
  prisonRegister: circuitBreakerBuilder(config.apis.prisonRegisterApi),
  calculateReleaseDates: circuitBreakerBuilder(config.apis.calculateReleaseDatesApi),
  alerts: circuitBreakerBuilder(config.apis.alertsApi),
  personIntegration: circuitBreakerBuilder(config.apis.personIntegrationApi),
  csip: circuitBreakerBuilder(config.apis.csipApi),
  healthAndMedication: circuitBreakerBuilder(config.apis.healthAndMedicationApi),
  personCommunicationNeeds: circuitBreakerBuilder(config.apis.personCommunicationNeedsApi),
  prisonerProfile: circuitBreakerBuilder({} as ApiConfig),
  personalRelationships: circuitBreakerBuilder(config.apis.personalRelationshipsApi),
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
