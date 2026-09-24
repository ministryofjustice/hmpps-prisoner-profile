import type CircuitBreaker from 'opossum'
import config from '../config'
import RestClient, { type Request } from './restClient'
import { CellMovementReason, CellMovementsApiClient } from './interfaces/cellMovementsApi'

export default class CellMovementsApiRestClient extends RestClient implements CellMovementsApiClient {
  constructor(token: string, circuitBreaker?: CircuitBreaker<[Request<unknown, unknown>, string], unknown>) {
    super('Cell Movements API', config.apis.cellMovementsApi, token, circuitBreaker)
  }

  /**
   * The reason and "what happened" text recorded against a NOMIS bed assignment. One call replaces
   * the whereabouts-api + case-notes two-hop this page made before; 404 means nothing was recorded
   * through DPS for this bed assignment, which is the common case and matches what whereabouts
   * returned.
   *
   * Requires the system client to hold ROLE_CELL_MOVEMENTS__RO.
   */
  async getCellMovementReason(
    bookingId: number,
    bedAssignmentSequence: number,
    ignore404: boolean,
  ): Promise<CellMovementReason | null> {
    if (ignore404) {
      return this.getAndIgnore404({
        path: `/cell-movements/${bookingId}/bed-assignment/${bedAssignmentSequence}`,
      })
    }
    return this.get(
      {
        path: `/cell-movements/${bookingId}/bed-assignment/${bedAssignmentSequence}`,
      },
      this.token,
    )
  }
}
