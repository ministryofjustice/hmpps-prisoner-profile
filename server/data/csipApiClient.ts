import RestClient from './restClient'
import config from '../config'
import CurrentCsipDetail from './interfaces/csipApi/csip'
import { CsipApiClient } from './interfaces/csipApi/csipApiClient'

export default class CsipApiRestClient implements CsipApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('CSIP API', config.apis.csipApi, token)
  }

  async getCurrentCsip(prisonerNumber: string): Promise<CurrentCsipDetail> {
    return this.restClient.get<CurrentCsipDetail>({
      path: `/prisoners/${prisonerNumber}/csip-records/current`,
    })
  }
}
