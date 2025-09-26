import RestClient from './restClient'
import config from '../config'
import AdjudicationsApiClient from './interfaces/adjudicationsApi/adjudicationsApiClient'
import AdjudicationSummary from './interfaces/adjudicationsApi/AdjudicationsSummary'

export default class AdjudicationsApiRestClient extends RestClient implements AdjudicationsApiClient {
  constructor(token: string) {
    super('Adjudications API', config.apis.adjudicationsApi, token)
  }

  async getAdjudications(bookingId: number): Promise<AdjudicationSummary> {
    return this.get({ path: `/adjudications/by-booking-id/${bookingId}` }, this.token)
  }
}
