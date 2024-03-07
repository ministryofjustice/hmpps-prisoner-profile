import RestClient from './restClient'
import Nominal from './interfaces/manageSocCasesApi/Nominal'
import { ManageSocCasesApiClient } from './interfaces/manageSocCasesApi/manageSocCasesApiClient'
import config from '../config'

export default class ManageSocCasesApiRestClient implements ManageSocCasesApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Manage SOC Cases API', config.apis.manageSocCasesApi, token)
  }

  async getNominal(offenderNumber: string): Promise<Nominal | null> {
    return this.restClient.get<Nominal | null>({ path: `/soc/nominal/nomsId/${offenderNumber}`, ignore404: true })
  }
}
