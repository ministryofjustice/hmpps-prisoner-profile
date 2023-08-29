import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { AlertType } from '../interfaces/prisonApi/alert'
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
