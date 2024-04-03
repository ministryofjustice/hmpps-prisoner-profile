import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import Address from '../data/interfaces/prisonApi/Address'

export default class AddressService {
  constructor(private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>) {}

  /**
   * Handle request for addresses
   *
   * @param token
   * @param prisonerNumber
   */
  public async getAddresses(token: string, prisonerNumber: string): Promise<Address[]> {
    return this.prisonApiClientBuilder(token).getAddresses(prisonerNumber)
  }
}
