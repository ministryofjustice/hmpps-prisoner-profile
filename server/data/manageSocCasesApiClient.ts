import config from '../config'
import RestClient from './restClient'
import { Nominal } from '../interfaces/pathfinderApi/nominal'
import { ManageSocCasesApiClient } from './interfaces/manageSocCasesApiClient'

export default class ManageSocCasesApiRestClient implements ManageSocCasesApiClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Manage SOC Cases API', config.apis.manageSocCasesApi, token)
  }

  async getNominal(offenderNumber: string): Promise<Nominal> {
    try {
      return await this.restClient.get<Nominal>({ path: `/soc/nominal/nomsId/${offenderNumber}` })
    } catch (error) {
      if (error.status === 404) {
        return null
      }
      return error
    }
  }
}
