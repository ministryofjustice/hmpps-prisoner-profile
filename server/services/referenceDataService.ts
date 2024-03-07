import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import { AlertType } from '../data/interfaces/prisonApi/Alert'
import { RestClientBuilder } from '../data'

export default class ReferenceDataService {
  constructor(private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>) {}

  /**
   * Get AlertType reference data
   */
  public async getAlertTypes(clientToken: string): Promise<AlertType[]> {
    const prisonApiClient = this.prisonApiClientBuilder(clientToken)

    return prisonApiClient.getAlertTypes()
  }
}
