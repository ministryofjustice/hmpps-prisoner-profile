/* eslint-disable import/first */
/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import config, { ApiConfig } from '../config'
import { buildAppInsightsClient, initialiseAppInsights } from '../utils/azureAppInsights'
import HmppsAuthClient, { systemTokenBuilder } from './hmppsAuthClient'
import { PrisonApiClient } from './interfaces/prisonApiClient'
import PrisonApiRestClientTwo from './prisonApiClientTwo'

import { createRedisClient } from './redisClient'
import RestClient, { RestClientBuilder as CreateRestClientBuilder } from './restClient'
import TokenStore from './tokenStore'

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
  systemToken: systemTokenBuilder(new TokenStore(createRedisClient())),
  hmppsAuthClientBuilder: restClientBuilder<HmppsAuthClient>(
    'HMPPS AuthClient',
    config.apis.hmppsAuth,
    HmppsAuthClient,
  ),
  prisonApiClientBuilder: restClientBuilder<PrisonApiClient>(
    'Prison API',
    config.apis.prisonApi,
    PrisonApiRestClientTwo,
  ),
}

export type DataAccess = typeof dataAccess

export { HmppsAuthClient, RestClientBuilder }
