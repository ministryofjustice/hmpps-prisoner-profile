import { RestClientBuilder } from '../data'
import type {
  PrisonerPropertyApiClient,
  PrisonerPropertySummary,
} from '../data/interfaces/prisonerPropertyApi/prisonerPropertyApiClient'
import logger from '../../logger'

/**
 * How long the set of prisons with the property service switched on is trusted before it is
 * refreshed. The list only changes when the property team toggles a prison during rollout, so a few
 * minutes keeps this off the hot path while staying responsive to a switch-on.
 */
export const ACTIVE_AGENCIES_TTL_MS = 5 * 60 * 1000

export default class PrisonerPropertyService {
  private activeAgencies: { ids: Set<string>; expiry: number } | null = null

  constructor(private readonly prisonerPropertyApiClientBuilder: RestClientBuilder<PrisonerPropertyApiClient>) {}

  async getPropertySummary(token: string, prisonerNumber: string): Promise<PrisonerPropertySummary> {
    return this.prisonerPropertyApiClientBuilder(token).getPrisonerPropertySummary(prisonerNumber)
  }

  /**
   * Whether the property service is switched on for the given prison.
   *
   * The active set is national and not user-specific, so a single process-wide cache is enough — no
   * Redis. On failure we log and fall back to the last known set (or an empty one), which means the
   * existing property card keeps showing: the safe default during rollout.
   */
  async isPrisonActive(token: string, prisonId: string): Promise<boolean> {
    if (!prisonId) return false

    const activeAgencyIds = await this.getActiveAgencyIds(token)
    return activeAgencyIds.has(prisonId) || activeAgencyIds.has('***')
  }

  private async getActiveAgencyIds(token: string): Promise<Set<string>> {
    const now = Date.now()
    if (this.activeAgencies && this.activeAgencies.expiry > now) {
      return this.activeAgencies.ids
    }

    try {
      const ids = new Set(await this.prisonerPropertyApiClientBuilder(token).getActiveAgencyIds())
      this.activeAgencies = { ids, expiry: now + ACTIVE_AGENCIES_TTL_MS }
      return ids
    } catch (error) {
      logger.warn(`Failed to load property service active agencies: ${(error as Error).message}`)
      return this.activeAgencies?.ids ?? new Set<string>()
    }
  }
}
