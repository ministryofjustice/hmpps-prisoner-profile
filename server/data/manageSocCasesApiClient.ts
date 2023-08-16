import RestClient from './restClient'
import { Nominal } from '../interfaces/pathfinderApi/nominal'
import { ManageSocCasesApiClient } from './interfaces/manageSocCasesApiClient'

export default class ManageSocCasesApiRestClient implements ManageSocCasesApiClient {
  constructor(private readonly restClient: RestClient) {}

  async getNominal(offenderNumber: string): Promise<Nominal> {
    return this.restClient.get<Nominal>({ path: `/soc/nominal/nomsId/${offenderNumber}`, ignore404: true })
  }
}
