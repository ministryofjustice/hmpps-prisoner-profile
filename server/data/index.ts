/* eslint-disable import/first */
/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import { buildAppInsightsClient, initialiseAppInsights } from '../utils/azureAppInsights'
import AllocationManagerApiClient from './allocationManagerApiClient'
import CaseNotesApiRestClient from './caseNotesApiClient'
import CuriousRestApiClient from './curiousApiClient'
import HmppsAuthClient, { systemTokenBuilder } from './hmppsAuthClient'
import IncentivesApiRestClient from './incentivesApiClient'
import KeyWorkerRestClient from './keyWorkersApiClient'
import ManageSocCasesApiRestClient from './manageSocCasesApiClient'
import PathfinderApiRestClient from './pathfinderApiClient'
import PrisonApiRestClient from './prisonApiClient'
import PrisonerSearchClient from './prisonerSearchClient'

import { createRedisClient } from './redisClient'
import TokenStore from './tokenStore'
import AdjudicationsApiRestClient from './adjudicationsApiClient'
import NonAssociationsApiRestClient from './nonAssociationsApiClient'
import ComponentApiRestClient from './componentApiClient'
import WhereaboutsRestApiClient from './whereaboutsClient'
import PrisonerProfileDeliusApiRestClient from './prisonerProfileDeliusApiClient'
import ManageUsersApiRestClient from './manageUsersApiClient'
import ComplexityApiRestClient from './complexityApiClient'

initialiseAppInsights()
buildAppInsightsClient()

type RestClientBuilder<T> = (token: string) => T

export const dataAccess = {
  // hmppsAuthClient: new HmppsAuthClient(new TokenStore(createRedisClient())),
  allocationManagerApiClientBuilder: (token: string) => new AllocationManagerApiClient(token),
  caseNotesApiClientBuilder: (token: string) => new CaseNotesApiRestClient(token),
  curiousApiClientBuilder: (token: string) => new CuriousRestApiClient(token),
  hmppsAuthClientBuilder: (token: string) => new HmppsAuthClient(token),
  incentivesApiClientBuilder: (token: string) => new IncentivesApiRestClient(token),
  keyworkerApiClientBuilder: (token: string) => new KeyWorkerRestClient(token),
  manageSocCasesApiClientBuilder: (token: string) => new ManageSocCasesApiRestClient(token),
  pathfinderApiClientBuilder: (token: string) => new PathfinderApiRestClient(token),
  adjudicationsApiClientBuilder: (token: string) => new AdjudicationsApiRestClient(token),
  prisonApiClientBuilder: (token: string) => new PrisonApiRestClient(token),
  prisonerSearchApiClientBuilder: (token: string) => new PrisonerSearchClient(token),
  systemToken: systemTokenBuilder(new TokenStore(createRedisClient())),
  nonAssociationsApiClientBuilder: (token: string) => new NonAssociationsApiRestClient(token),
  componentApiClientBuilder: (token: string) => new ComponentApiRestClient(token),
  whereaboutsApiClientBuilder: (token: string) => new WhereaboutsRestApiClient(token),
  prisonerProfileDeliusApiClientBuilder: (token: string) => new PrisonerProfileDeliusApiRestClient(token),
  manageUsersApiClientBuilder: (token: string) => new ManageUsersApiRestClient(token),
  complexityApiClientBuilder: (token: string) => new ComplexityApiRestClient(token),
}

export type DataAccess = typeof dataAccess

export { HmppsAuthClient, RestClientBuilder }
