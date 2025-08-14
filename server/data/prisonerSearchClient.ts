import RestClient from './restClient'
import Prisoner from './interfaces/prisonerSearchApi/Prisoner'
import { PrisonerSearchClient } from './interfaces/prisonerSearchApi/prisonerSearchClient'
import config from '../config'

export default class PrisonerSearchRestClient extends RestClient implements PrisonerSearchClient {
  constructor(token: string) {
    super('Prison Offender Search API', config.apis.prisonerSearchApi, token)
  }

  async getPrisonerDetails(prisonerNumber: string): Promise<Prisoner> {
    try {
      const prisonerData = await this.get<Prisoner>({ path: `/prisoner/${prisonerNumber}` }, this.token)
      return {
        ...prisonerData,
        bookingId: prisonerData.bookingId ? +prisonerData.bookingId : undefined,
      }
    } catch (error) {
      return error
    }
  }
}
