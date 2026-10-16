import type CircuitBreaker from 'opossum'
import config from '../config'
import type {
  PrisonerPropertyApiClient,
  PrisonerPropertySummary,
} from './interfaces/prisonerPropertyApi/prisonerPropertyApiClient'
import RestClient, { type Request } from './restClient'

export default class PrisonerPropertyApiRestClient extends RestClient implements PrisonerPropertyApiClient {
  constructor(token: string, circuitBreaker?: CircuitBreaker<[Request<unknown, unknown>, string], unknown>) {
    super('Prisoner Property API', config.apis.prisonerPropertyApi, token, circuitBreaker)
  }

  /** Requires the system client to hold ROLE_PRISONER_PROPERTY__RO. */
  async getPrisonerPropertySummary(prisonerNumber: string): Promise<PrisonerPropertySummary> {
    return this.get<PrisonerPropertySummary>(
      { path: `/property-containers/prisoner/${encodeURIComponent(prisonerNumber)}/summary` },
      this.token,
    )
  }
}
