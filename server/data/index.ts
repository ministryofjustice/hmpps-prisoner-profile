/* eslint-disable import/first */
/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import config, { ApiConfig } from '../config'
import { buildAppInsightsClient, initialiseAppInsights } from '../utils/azureAppInsights'
import AllocationManagerApiClient from './allocationManagerApiClient'
import CaseNotesApiRestClient from './caseNotesApiClient'
import CuriousRestApiClient from './curiousApiClient'
import HmppsAuthClient, { systemTokenBuilder } from './hmppsAuthClient'
import IncentivesApiRestClient from './incentivesApiClient'
import AllocationManagerClient from './interfaces/allocationManagerClient'
import { CaseNotesApiClient } from './interfaces/caseNotesApiClient'
import CuriousApiClient from './interfaces/curiousApiClient'
import { IncentivesApiClient } from './interfaces/incentivesApiClient'
import KeyWorkerClient from './interfaces/keyWorkerClient'
import { ManageSocCasesApiClient } from './interfaces/manageSocCasesApiClient'
import { PathfinderApiClient } from './interfaces/pathfinderApiClient'
import { PrisonApiClient } from './interfaces/prisonApiClient'
import KeyWorkerRestClient from './keyWorkersApiClient'
import ManageSocCasesApiRestClient from './manageSocCasesApiClient'
import PathfinderApiRestClient from './pathfinderApiClient'
import PrisonApiRestClient from './prisonApiClient'
import PrisonerSearchClient from './prisonerSearchClient'
import { AdjudicationsApiClient } from './interfaces/adjudicationsApiClient'

import { createRedisClient } from './redisClient'
import RestClient, { RestClientBuilder as CreateRestClientBuilder } from './restClient'
import TokenStore from './tokenStore'
import AdjudicationsApiRestClient from './adjudicationsApiClient'

initialiseAppInsights()
buildAppInsightsClient()

type RestClientBuilder<T> = (token: string) => T

export default function restClientBuilder<T>(
  name: string,
  options: ApiConfig,
  constructor: new (client: RestClient) => T,
): RestClientBuilder<T> {
  const restClient = CreateRestClientBuilder(name, options)
  return token => new constructor(restClient(token))
}

export const dataAccess = {
  // hmppsAuthClient: new HmppsAuthClient(new TokenStore(createRedisClient())),
  allocationManagerApiClientBuilder: restClientBuilder<AllocationManagerClient>(
    'Allocation Manager API',
    config.apis.allocationManager,
    AllocationManagerApiClient,
  ),
  caseNotesApiClientBuilder: restClientBuilder<CaseNotesApiClient>(
    'Case Notes API',
    config.apis.caseNotesApi,
    CaseNotesApiRestClient,
  ),
  curiousApiClientBuilder: restClientBuilder<CuriousApiClient>(
    'Curious API',
    config.apis.curiousApiUrl,
    CuriousRestApiClient,
  ),
  hmppsAuthClientBuilder: restClientBuilder<HmppsAuthClient>(
    'HMPPS AuthClient',
    config.apis.hmppsAuth,
    HmppsAuthClient,
  ),
  incentivesApiClientBuilder: restClientBuilder<IncentivesApiClient>(
    'Case Notes API',
    config.apis.incentivesApi,
    IncentivesApiRestClient,
  ),
  keyworkerApiClientBuilder: restClientBuilder<KeyWorkerClient>(
    'KeyWorkers API',
    config.apis.keyworker,
    KeyWorkerRestClient,
  ),
  manageSocCasesApiClientBuilder: restClientBuilder<ManageSocCasesApiClient>(
    'Manage SOC Cases API',
    config.apis.manageSocCasesApi,
    ManageSocCasesApiRestClient,
  ),
  pathfinderApiClientBuilder: restClientBuilder<PathfinderApiClient>(
    'Pathfinder API',
    config.apis.pathfinderApi,
    PathfinderApiRestClient,
  ),
  adjudicationsApiClientBuilder: restClientBuilder<AdjudicationsApiClient>(
    'Adjudications API',
    config.apis.adjudicationsApi,
    AdjudicationsApiRestClient,
  ),
  prisonApiClientBuilder: restClientBuilder<PrisonApiClient>('Prison API', config.apis.prisonApi, PrisonApiRestClient),
  prisonerSearchApiClientBuilder: restClientBuilder<PrisonerSearchClient>(
    'Prison Offender Search API',
    config.apis.prisonerSearchApi,
    PrisonerSearchClient,
  ),
  systemToken: systemTokenBuilder(new TokenStore(createRedisClient())),
}

export type DataAccess = typeof dataAccess

export { HmppsAuthClient, RestClientBuilder }
