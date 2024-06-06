/* eslint-disable import/first */
/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import { buildAppInsightsClient, initialiseAppInsights } from '../utils/azureAppInsights'
import AllocationManagerApiClient from './allocationManagerApiClient'
import CaseNotesApiRestClient from './caseNotesApiClient'
import CuriousRestApiClient from './curiousApiClient'
import { systemTokenBuilder } from './hmppsAuthClient'
import IncentivesApiRestClient from './incentivesApiClient'
import KeyWorkerRestClient from './keyWorkersApiClient'
import ManageSocCasesApiRestClient from './manageSocCasesApiClient'
import PathfinderApiRestClient from './pathfinderApiClient'
import PrisonApiRestClient from './prisonApiClient'
import PrisonerSearchClient from './prisonerSearchClient'

import { createRedisClient } from './redisClient'
import AdjudicationsApiRestClient from './adjudicationsApiClient'
import NonAssociationsApiRestClient from './nonAssociationsApiClient'
import ComponentApiRestClient from './componentApiClient'
import WhereaboutsRestApiClient from './whereaboutsClient'
import PrisonerProfileDeliusApiRestClient from './prisonerProfileDeliusApiClient'
import ManageUsersApiRestClient from './manageUsersApiClient'
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

initialiseAppInsights()
buildAppInsightsClient(applicationInfo())

type RestClientBuilder<T> = (token: string) => T

export const dataAccess = {
  applicationInfo: applicationInfo(),
  allocationManagerApiClientBuilder: (token: string) => new AllocationManagerApiClient(token),
  caseNotesApiClientBuilder: (token: string) => new CaseNotesApiRestClient(token),
  curiousApiClientBuilder: (token: string) => new CuriousRestApiClient(token),
  incentivesApiClientBuilder: (token: string) => new IncentivesApiRestClient(token),
  keyworkerApiClientBuilder: (token: string) => new KeyWorkerRestClient(token),
  manageSocCasesApiClientBuilder: (token: string) => new ManageSocCasesApiRestClient(token),
  pathfinderApiClientBuilder: (token: string) => new PathfinderApiRestClient(token),
  adjudicationsApiClientBuilder: (token: string) => new AdjudicationsApiRestClient(token),
  prisonApiClientBuilder: (token: string) => new PrisonApiRestClient(token),
  prisonerSearchApiClientBuilder: (token: string) => new PrisonerSearchClient(token),
  systemToken: systemTokenBuilder(
    config.redis.enabled ? new RedisTokenStore(createRedisClient()) : new InMemoryTokenStore(),
  ),
  nonAssociationsApiClientBuilder: (token: string) => new NonAssociationsApiRestClient(token),
  componentApiClientBuilder: (token: string) => new ComponentApiRestClient(token),
  whereaboutsApiClientBuilder: (token: string) => new WhereaboutsRestApiClient(token),
  prisonerProfileDeliusApiClientBuilder: (token: string) => new PrisonerProfileDeliusApiRestClient(token),
  manageUsersApiClientBuilder: (token: string) => new ManageUsersApiRestClient(token),
  complexityApiClientBuilder: (token: string) => new ComplexityApiRestClient(token),
  educationAndWorkPlanApiClientBuilder: (token: string) => new EducationAndWorkPlanApiRestClient(token),
  restrictedPatientApiClientBuilder: (token: string) => new RestrictedPatientApiRestClient(token),
  prisonRegisterApiClientBuilder: (token: string) => new PrisonRegisterApiRestClient(token),
  prisonRegisterStore: new PrisonRegisterStore(createRedisClient()),
  calculateReleaseDatesApiClientBuilder: (token: string) => new CalculateReleaseDatesApiClient(token),
  alertsApiClientBuilder: (token: string) => new AlertsApiRestClient(token),
  featureToggleStore: config.redis.enabled
    ? new RedisFeatureToggleStore(createRedisClient())
    : new InMemoryFeatureToggleStore(),
}

export type DataAccess = typeof dataAccess

export { RestClientBuilder }
