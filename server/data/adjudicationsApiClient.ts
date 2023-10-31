import RestClient from './restClient'
import { AdjudicationsApiClient } from './interfaces/adjudicationsApiClient'
import { AdjudicationSummary } from '../interfaces/adjudicationSummary'
import config from '../config'

export default class AdjudicationsApiRestClient implements AdjudicationsApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Adjudications API', config.apis.adjudicationsApi, token)
  }

  private async get<T>(args: object, localMockData?: T): Promise<T> {
    try {
      return await this.restClient.get<T>(args)
    } catch (error) {
      if (config.localMockData === 'true' && localMockData) {
        return localMockData
      }
      return error
    }
  }

  async getAdjudications(bookingId: number): Promise<AdjudicationSummary> {
    return this.get<AdjudicationSummary>({ path: `/adjudications/by-booking-id/${bookingId}` })
  }
}
