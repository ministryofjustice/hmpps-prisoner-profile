import RestClient from './restClient'
import { Prisoner } from '../interfaces/prisoner'
import { PrisonerSearchClient } from './interfaces/prisonerSearchClient'

export default class PrisonerSearchRestClient implements PrisonerSearchClient {
  constructor(private readonly restClient: RestClient) {}

  getPrisonerDetails(prisonerNumber: string): Promise<Prisoner> {
    return this.restClient.get({ path: `/prisoner/${prisonerNumber}` }).catch(err => {
      return err
    }) as Promise<Prisoner>
  }
}
