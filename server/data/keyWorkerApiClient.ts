import CircuitBreaker from 'opossum'
import RestClient, { Request } from './restClient'
import config from '../config'
import KeyWorkerClient from './interfaces/keyWorkerApi/keyWorkerClient'
import StaffAllocation from './interfaces/keyWorkerApi/StaffAllocation'

export default class KeyWorkerRestClient extends RestClient implements KeyWorkerClient {
  constructor(token: string, circuitBreaker?: CircuitBreaker<[Request<unknown, unknown>, string], unknown>) {
    super('KeyWorkers API', config.apis.keyworker, token, circuitBreaker)
  }

  async getCurrentAllocations(
    offenderNumber: string,
    includeContactDetails: boolean = false,
  ): Promise<StaffAllocation> {
    return Promise.reject('fail')

    // return this.get(
    //   {
    //     path: `/prisoners/${offenderNumber}/allocations/current?includeContactDetails=${includeContactDetails}`,
    //   },
    //   this.token,
    // ) OLDCODE
  }
}
