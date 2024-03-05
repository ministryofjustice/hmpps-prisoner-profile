import RestClient from './restClient'
import Prisoner from './interfaces/prisonerSearchApi/Prisoner'
import { PrisonerSearchClient } from './interfaces/prisonerSearchApi/prisonerSearchClient'
import config from '../config'

export default class PrisonerSearchRestClient implements PrisonerSearchClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Prison Offender Search API', config.apis.prisonerSearchApi, token)
  }

  async getPrisonerDetails(prisonerNumber: string): Promise<Prisoner> {
    try {
      const prisonerData = await this.restClient.get<Prisoner>({ path: `/prisoner/${prisonerNumber}` })
      return {
        ...prisonerData,
        bookingId: prisonerData.bookingId ? +prisonerData.bookingId : undefined,
      }
    } catch (error) {
      return error
    }
  }
}
