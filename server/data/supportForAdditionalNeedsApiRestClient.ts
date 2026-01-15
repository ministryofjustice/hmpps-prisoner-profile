import type CircuitBreaker from 'opossum'
import config from '../config'
import RestClient, { type Request } from './restClient'
import type { SupportForAdditionalNeedsApiClient } from './interfaces/supportForAdditionalNeedsApi/supportForAdditionalNeedsApiClient'
import type { HasNeed } from './interfaces/supportForAdditionalNeedsApi/SupportForAdditionalNeeds'

export default class SupportForAdditionalNeedsApiRestClient
  extends RestClient
  implements SupportForAdditionalNeedsApiClient
{
  constructor(token: string, circuitBreaker?: CircuitBreaker<[Request<unknown, unknown>, string], unknown>) {
    super('Support for Additional Needs API', config.apis.supportForAdditionalNeeds, token, circuitBreaker)
  }

  hasNeedsForAdditionalSupport(prisonerNumber: string): Promise<HasNeed> {
    return this.get({ path: `/profile/${prisonerNumber}/has-need` }, this.token)
  }
}
