import RestClient from './restClient'
import config from '../config'
import { Pom } from '../interfaces/pom'
import AllocationManagerClient from './interfaces/allocationManagerClient'

export default class AllocationManagerApiClient implements AllocationManagerClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Allocation Manager API', config.apis.allocationManager, token)
  }

  async getPomByOffenderNo(offenderNumber: string): Promise<Pom> {
    try {
      return await this.restClient.get<Pom>({ path: `/api/allocation/${offenderNumber}` })
    } catch (error) {
      return error
    }
  }
}
