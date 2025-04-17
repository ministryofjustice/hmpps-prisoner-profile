import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import Belief from '../data/interfaces/prisonApi/Belief'

export default class BeliefService {
  constructor(private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>) {}

  /**
   * Handle request for belief history
   *
   * @param token
   * @param prisonerNumber
   * @param bookingId
   */
  public async getBeliefHistory(token: string, prisonerNumber: string, bookingId?: number): Promise<Belief[]> {
    return this.prisonApiClientBuilder(token).getBeliefHistory(prisonerNumber, bookingId)
  }
}
