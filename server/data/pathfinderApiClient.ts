import RestClient from './restClient'
import { PathfinderApiClient } from './interfaces/pathfinderApi/pathfinderApiClient'
import Nominal from './interfaces/manageSocCasesApi/Nominal'
import config from '../config'

export default class PathfinderApiRestClient extends RestClient implements PathfinderApiClient {
  constructor(token: string) {
    super('Pathfinder API', config.apis.pathfinderApi, token)
  }

  async getNominal(offenderNumber: string): Promise<Nominal | null> {
    return this.getAndIgnore404<Nominal | null>({
      path: `/pathfinder/nominal/noms-id/${offenderNumber}`,
    })
  }
}
