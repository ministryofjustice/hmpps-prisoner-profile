import RestClient from './restClient'
import { Prisoner } from '../interfaces/prisoner'
import TokenStore from './tokenStore'
import config from '../config'

export default class PrisonerSearchClient {
  restClient: RestClient

  constructor(private readonly tokenStore: TokenStore) {}

  private static restClient(token: string): RestClient {
    return new RestClient('Prison Offender Search API', config.apis.prisonerSearchApi, token)
  }

  getPrisonerDetails(token: string, prisonerNumber: string): Promise<Prisoner> {
    return PrisonerSearchClient.restClient(token)
      .get({ path: `/prisoner/${prisonerNumber}` })
      .catch(err => {
        return err
      }) as Promise<Prisoner>
  }
}
