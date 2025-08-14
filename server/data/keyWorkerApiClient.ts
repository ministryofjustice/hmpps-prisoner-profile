import RestClient from './restClient'
import KeyWorker from './interfaces/keyWorkerApi/KeyWorker'
import config from '../config'
import KeyWorkerClient from './interfaces/keyWorkerApi/keyWorkerClient'
import StaffAllocation from './interfaces/keyWorkerApi/StaffAllocation'

export default class KeyWorkerRestClient extends RestClient implements KeyWorkerClient {
  constructor(token: string) {
    super('KeyWorkers API', config.apis.keyworker, token)
  }

  async getOffendersKeyWorker(offenderNumber: string): Promise<KeyWorker> {
    return this.getAndIgnore404<KeyWorker>({ path: `/key-worker/offender/${offenderNumber}` })
  }

  async getCurrentAllocations(offenderNumber: string): Promise<StaffAllocation> {
    return this.get<StaffAllocation>(
      {
        path: `/prisoners/${offenderNumber}/allocations/current`,
      },
      this.token,
    )
  }
}
