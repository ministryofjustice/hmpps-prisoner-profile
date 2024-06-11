import config from '../config'
import { PrisonPerson, PrisonPersonApiClient } from './interfaces/prisonPersonApi/prisonPersonApiClient'
import RestClient from './restClient'

export default class PrisonPersonApiRestClient implements PrisonPersonApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Prison Register API', config.apis.prisonPersonApi, token)
  }

  async getPrisonPerson(prisonerNumber: string): Promise<PrisonPerson> {
    return this.restClient.get<PrisonPerson>({ path: `/prisoners/${prisonerNumber}` })
  }
}
