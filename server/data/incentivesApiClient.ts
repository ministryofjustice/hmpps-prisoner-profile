import config from '../config'
import RestClient from './restClient'
import { IncentivesApiClient } from './interfaces/incentivesApiClient'
import { IncentiveReviews } from '../interfaces/IncentivesApi/incentiveReviews'

export default class IncentivesApiRestClient implements IncentivesApiClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Case Notes API', config.apis.incentivesApi, token)
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

  async getReviews(bookingId: number): Promise<IncentiveReviews> {
    return this.get<IncentiveReviews>({
      path: `/iep/reviews/booking/${bookingId}`,
    })
  }
}
