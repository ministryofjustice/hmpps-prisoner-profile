import RestClient from './restClient'
import { Prisoner } from '../interfaces/prisoner'
import { PrisonerSearchClient } from './interfaces/prisonerSearchClient'
import config from '../config'

export default class PrisonerSearchRestClient implements PrisonerSearchClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Prison Offender Search API', config.apis.prisonerSearchApi, token)
  }

  getPrisonerDetails(prisonerNumber: string): Promise<Prisoner> {
    return this.restClient.get({ path: `/prisoner/${prisonerNumber}` }).catch(err => {
      return err
    }) as Promise<Prisoner>
  }
}
