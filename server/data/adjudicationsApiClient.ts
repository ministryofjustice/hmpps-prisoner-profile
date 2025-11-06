import CircuitBreaker from 'opossum'
import RestClient, { Request } from './restClient'
import config from '../config'
import AdjudicationsApiClient from './interfaces/adjudicationsApi/adjudicationsApiClient'
import AdjudicationSummary from './interfaces/adjudicationsApi/AdjudicationsSummary'

export default class AdjudicationsApiRestClient extends RestClient implements AdjudicationsApiClient {
  constructor(token: string, circuitBreaker?: CircuitBreaker<[Request<unknown, unknown>, string], unknown>) {
    super('Adjudications API', config.apis.adjudicationsApi, token, circuitBreaker)
  }

  async getAdjudications(bookingId: number): Promise<AdjudicationSummary> {
    return Promise.reject('err')
    // return this.get({ path: `/adjudications/by-booking-id/${bookingId}` }, this.token) OLDCODE
  }
}
