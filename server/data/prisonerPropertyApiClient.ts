import type CircuitBreaker from 'opossum'
import config from '../config'
import type { PrisonerPropertyApiClient, PrisonerPropertySummary } from './interfaces/prisonerPropertyApi'
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

  /**
   * The agency ids the property service is switched on for, from the API's `/info` endpoint. That
   * endpoint is public and ignores the token, but RestClient requires one, so we pass ours through.
   * Returns [] when the key is absent (e.g. an older API deploy) so callers degrade to "no prison
   * active" rather than erroring.
   */
  async getActiveAgencyIds(): Promise<string[]> {
    const info = await this.get<{ activeAgencies?: string[] }>({ path: '/info' }, this.token)
    return info?.activeAgencies ?? []
  }
}
