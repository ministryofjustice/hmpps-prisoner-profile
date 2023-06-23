import RestClient from './restClient'
import { Pom } from '../interfaces/pom'
import AllocationManagerClient from './interfaces/allocationManagerClient'

export default class AllocationManagerApiClient implements AllocationManagerClient {
  constructor(private readonly restClient: RestClient) {}

  async getPomByOffenderNo(offenderNumber: string): Promise<Pom> {
    try {
      return await this.restClient.get<Pom>({ path: `/api/allocation/${offenderNumber}` })
    } catch (error) {
      return error
    }
  }
}
