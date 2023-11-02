import RestClient from './restClient'
import { AdjudicationsApiClient } from './interfaces/adjudicationsApiClient'
import { AdjudicationSummary } from '../interfaces/adjudicationSummary'
import config from '../config'

export default class AdjudicationsApiRestClient implements AdjudicationsApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Adjudications API', config.apis.adjudicationsApi, token)
  }

  async getAdjudications(bookingId: number): Promise<AdjudicationSummary> {
    return this.restClient.get<AdjudicationSummary>({ path: `/adjudications/by-booking-id/${bookingId}` })
  }
}
