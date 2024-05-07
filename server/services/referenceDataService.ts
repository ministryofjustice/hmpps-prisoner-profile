import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import { PrisonApiAlertType } from '../data/interfaces/prisonApi/PrisonApiAlert'
import { RestClientBuilder } from '../data'

export default class ReferenceDataService {
  constructor(private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>) {}

  /**
   * Get AlertType reference data
   */
  public async getAlertTypes(clientToken: string): Promise<PrisonApiAlertType[]> {
    const prisonApiClient = this.prisonApiClientBuilder(clientToken)

    return prisonApiClient.getAlertTypes()
  }
}
