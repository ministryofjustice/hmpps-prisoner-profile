import RestClient from './restClient'
import { PathfinderApiClient } from './interfaces/pathfinderApiClient'
import { Nominal } from '../interfaces/pathfinderApi/nominal'

export default class PathfinderApiRestClient implements PathfinderApiClient {
  constructor(private readonly restClient: RestClient) {}

  async getNominal(offenderNumber: string): Promise<Nominal> {
    return this.restClient.get<Nominal>({
      path: `/pathfinder/nominal/noms-id/${offenderNumber}`,
      ignore404: true,
    })
  }
}
