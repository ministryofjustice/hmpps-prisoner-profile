import RestClient from './restClient'
import config from '../config'
import KeyWorkerClient from './interfaces/keyWorkerApi/keyWorkerClient'
import StaffAllocation from './interfaces/keyWorkerApi/StaffAllocation'

export default class KeyWorkerRestClient extends RestClient implements KeyWorkerClient {
  constructor(token: string) {
    super('KeyWorkers API', config.apis.keyworker, token)
  }

  async getCurrentAllocations(
    offenderNumber: string,
    includeContactDetails: boolean = false,
  ): Promise<StaffAllocation> {
    return this.get<StaffAllocation>(
      {
        path: `/prisoners/${offenderNumber}/allocations/current?includeContactDetails=${includeContactDetails}`,
      },
      this.token,
    )
  }
}
