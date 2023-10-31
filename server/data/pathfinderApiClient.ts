import RestClient from './restClient'
import { PathfinderApiClient } from './interfaces/pathfinderApiClient'
import { Nominal } from '../interfaces/pathfinderApi/nominal'
import config from '../config'

export default class PathfinderApiRestClient implements PathfinderApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Pathfinder API', config.apis.pathfinderApi, token)
  }

  async getNominal(offenderNumber: string): Promise<Nominal | null> {
    return this.restClient.get<Nominal | null>({
      path: `/pathfinder/nominal/noms-id/${offenderNumber}`,
      ignore404: true,
    })
  }
}
