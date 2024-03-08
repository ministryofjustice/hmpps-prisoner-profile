import RestClient from './restClient'
import config from '../config'
import AllocationManagerClient from './interfaces/allocationManagerApi/allocationManagerClient'
import Pom from './interfaces/allocationManagerApi/Pom'

export default class AllocationManagerApiClient implements AllocationManagerClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Allocation Manager API', config.apis.allocationManager, token)
  }

  async getPomByOffenderNo(offenderNumber: string): Promise<Pom> {
    return this.restClient.get<Pom>({ path: `/api/allocation/${offenderNumber}`, ignore404: true })
  }
}
