import { RestClientBuilder } from '../data'
import CurrentCsipDetail from '../data/interfaces/csipApi/csip'
import { CsipApiClient } from '../data/interfaces/csipApi/csipApiClient'

export default class CsipService {
  constructor(private readonly csipApiClientBuilder: RestClientBuilder<CsipApiClient>) {}

  /**
   * Handle request for Current CSIP Details
   *
   * @param token
   * @param prisonerNumber
   */
  public async getCurrentCsip(token: string, prisonerNumber: string): Promise<CurrentCsipDetail> {
    return this.csipApiClientBuilder(token).getCurrentCsip(prisonerNumber)
  }
}
