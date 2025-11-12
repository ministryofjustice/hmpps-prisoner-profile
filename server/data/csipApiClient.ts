import CircuitBreaker from 'opossum'
import RestClient, { Request } from './restClient'
import config from '../config'
import CurrentCsipDetail from './interfaces/csipApi/csip'
import { CsipApiClient } from './interfaces/csipApi/csipApiClient'

export default class CsipApiRestClient extends RestClient implements CsipApiClient {
  constructor(token: string, circuitBreaker?: CircuitBreaker<[Request<unknown, unknown>, string], unknown>) {
    super('CSIP API', config.apis.csipApi, token, circuitBreaker)
  }

  async getCurrentCsip(prisonerNumber: string): Promise<CurrentCsipDetail> {
    return this.get(
      {
        path: `/prisoners/${prisonerNumber}/csip-records/current`,
      },
      this.token,
    )
  }
}
