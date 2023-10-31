import RestClient from './restClient'
import { Pom } from '../interfaces/pom'
import AllocationManagerClient from './interfaces/allocationManagerClient'
import config from '../config'

export default class AllocationManagerApiClient implements AllocationManagerClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Allocation Manager API', config.apis.allocationManager, token)
  }

  async getPomByOffenderNo(offenderNumber: string): Promise<Pom> {
    return this.restClient.get<Pom>({ path: `/api/allocation/${offenderNumber}`, ignore404: true })
  }
}
