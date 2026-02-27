import CircuitBreaker from 'opossum'
import RestClient, { Request } from './restClient'
import Prisoner from './interfaces/prisonerSearchApi/Prisoner'
import { PrisonerSearchClient } from './interfaces/prisonerSearchApi/prisonerSearchClient'
import config from '../config'

export default class PrisonerSearchRestClient extends RestClient implements PrisonerSearchClient {
  constructor(token: string, circuitBreaker?: CircuitBreaker<[Request<unknown, unknown>, string], unknown>) {
    super('Prison Offender Search API', config.apis.prisonerSearchApi, token, circuitBreaker)
  }

  async getPrisonerDetails(prisonerNumber: string): Promise<Prisoner> {
    const prisonerData = await this.get<Prisoner>({ path: `/prisoner/${prisonerNumber}` }, this.token)
    return {
      ...prisonerData,
      bookingId: prisonerData.bookingId ? +prisonerData.bookingId : undefined,
    }
  }

  async findByNumbers(prisonerNumbers: string[]): Promise<Prisoner[]> {
    const prisonerData = await this.post<Prisoner[]>(
      { path: `/prisoner-numbers`, data: { prisonerNumbers } },
      this.token,
    )
    return Array.isArray(prisonerData) ? prisonerData : []
  }
}
