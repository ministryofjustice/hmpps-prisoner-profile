import config from '../config'
import RestClient from './restClient'
import { PathfinderApiClient } from './interfaces/pathfinderApiClient'
import { Nominal } from '../interfaces/pathfinderApi/nominal'

export default class PathfinderApiRestClient implements PathfinderApiClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Pathfinder API', config.apis.pathfinderApi, token)
  }

  async getNominal(offenderNumber: string): Promise<Nominal> {
    try {
      return await this.restClient.get<Nominal>({ path: `/pathfinder/nominal/noms-id/${offenderNumber}` })
    } catch (error) {
      if (error.status === 404) {
        return null
      }
      return error
    }
  }
}
