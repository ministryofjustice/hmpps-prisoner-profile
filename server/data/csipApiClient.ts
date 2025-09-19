import RestClient from './restClient'
import config from '../config'
import CurrentCsipDetail from './interfaces/csipApi/csip'
import { CsipApiClient } from './interfaces/csipApi/csipApiClient'

export default class CsipApiRestClient extends RestClient implements CsipApiClient {
  constructor(token: string) {
    super('CSIP API', config.apis.csipApi, token)
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
