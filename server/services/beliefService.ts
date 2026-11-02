import type { RestClientBuilder } from '../data'
import type { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import type { BeliefHistoryItem } from './interfaces/beliefService/BeliefHistoryItem'

export default class BeliefService {
  constructor(private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>) {}

  /**
   * Handle request for belief history
   *
   * @param token
   * @param prisonerNumber
   */
  public async getBeliefHistory(token: string, prisonerNumber: string): Promise<BeliefHistoryItem[]> {
    const history = await this.prisonApiClientBuilder(token).getBeliefHistory(prisonerNumber)
    return history.map<BeliefHistoryItem>(item => ({
      current: !item.endDate,
      religionCode: item.beliefCode,
      religionDescription: item.beliefDescription,
      changeReasonKnown: item.changeReason,
      comments: item.comments,
      startDate: item.startDate,
      endDate: item.endDate,
      createUserFirstName: item.addedByFirstName,
      createUserLastName: item.addedByLastName,
      modifyUserFirstName: item.updatedByFirstName,
      modifyUserLastName: item.updatedByLastName,
      modifyDate: item.updatedDate,
    }))
  }
}
