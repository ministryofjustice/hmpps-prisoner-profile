import config from '../config'
import RestClient from './restClient'
import { Prisoner } from '../interfaces/prisoner'

export default class PrisonSearchClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Prison Offender Search API', config.apis.prisonSearchApi, token)
  }

  getPrisoner(): Promise<Prisoner> {
    return this.restClient.get({ path: '/prisoner/G5897GP' }).catch(err => {
      return err
    }) as Promise<Prisoner>
  }
}
