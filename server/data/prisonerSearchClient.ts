import config from '../config'
import RestClient from './restClient'
import { Prisoner } from '../interfaces/prisoner'

export default class PrisonerSearchClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Prison Offender Search API', config.apis.prisonerSearchApi, token)
  }

  getPrisonerDetails(prisonerNumber: string): Promise<Prisoner> {
    return this.restClient.get({ path: `/prisoner/${prisonerNumber}` }).catch(err => {
      return err
    }) as Promise<Prisoner>
  }
}
