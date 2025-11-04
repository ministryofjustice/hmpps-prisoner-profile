import CircuitBreaker from 'opossum'
import RestClient, { Request } from './restClient'
import config from '../config'
import AllocationManagerClient from './interfaces/allocationManagerApi/allocationManagerClient'
import Pom from './interfaces/allocationManagerApi/Pom'

export default class AllocationManagerApiClient extends RestClient implements AllocationManagerClient {
  constructor(token: string, circuitBreaker?: CircuitBreaker<[Request<unknown, unknown>, string], unknown>) {
    super('Allocation Manager API', config.apis.allocationManager, token, circuitBreaker)
  }

  async getPomByOffenderNo(offenderNumber: string): Promise<Pom | null> {
    return this.getAndIgnore404({ path: `/api/allocation/${offenderNumber}` })
  }
}
