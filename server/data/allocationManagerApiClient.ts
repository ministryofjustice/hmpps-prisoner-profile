import RestClient from './restClient'
import config from '../config'
import AllocationManagerClient from './interfaces/allocationManagerApi/allocationManagerClient'
import Pom from './interfaces/allocationManagerApi/Pom'

export default class AllocationManagerApiClient extends RestClient implements AllocationManagerClient {
  constructor(token: string) {
    super('Allocation Manager API', config.apis.allocationManager, token)
  }

  async getPomByOffenderNo(offenderNumber: string): Promise<Pom> {
    return this.getAndIgnore404<Pom>({ path: `/api/allocation/${offenderNumber}` })
  }
}
