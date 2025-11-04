import CircuitBreaker from 'opossum'
import RestClient, { Request } from './restClient'
import { PathfinderApiClient } from './interfaces/pathfinderApi/pathfinderApiClient'
import Nominal from './interfaces/manageSocCasesApi/Nominal'
import config from '../config'

export default class PathfinderApiRestClient extends RestClient implements PathfinderApiClient {
  constructor(token: string, circuitBreaker?: CircuitBreaker<[Request<unknown, unknown>, string], unknown>) {
    super('Pathfinder API', config.apis.pathfinderApi, token, circuitBreaker)
  }

  async getNominal(offenderNumber: string): Promise<Nominal | null> {
    return this.getAndIgnore404({
      path: `/pathfinder/nominal/noms-id/${offenderNumber}`,
    })
  }
}
