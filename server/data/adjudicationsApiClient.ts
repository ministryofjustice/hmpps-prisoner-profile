import RestClient from './restClient'
import { AdjudicationsApiClient } from './interfaces/adjudicationsApiClient'
import { AdjudicationSummary } from '../interfaces/adjudicationSummary'

export default class AdjudicationsApiRestClient implements AdjudicationsApiClient {
  constructor(private readonly restClient: RestClient) {}

  async getAdjudications(bookingId: number): Promise<AdjudicationSummary> {
    return this.restClient.get<AdjudicationSummary>({ path: `/adjudications/by-booking-id/${bookingId}` })
  }
}
