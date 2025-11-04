import CircuitBreaker from 'opossum'
import RestClient, { Request } from './restClient'
import Nominal from './interfaces/manageSocCasesApi/Nominal'
import { ManageSocCasesApiClient } from './interfaces/manageSocCasesApi/manageSocCasesApiClient'
import config from '../config'

export default class ManageSocCasesApiRestClient extends RestClient implements ManageSocCasesApiClient {
  constructor(token: string, circuitBreaker?: CircuitBreaker<[Request<unknown, unknown>, string], unknown>) {
    super('Manage SOC Cases API', config.apis.manageSocCasesApi, token, circuitBreaker)
  }

  async getNominal(offenderNumber: string): Promise<Nominal | null> {
    return this.getAndIgnore404({ path: `/soc/nominal/nomsId/${offenderNumber}` })
  }
}
