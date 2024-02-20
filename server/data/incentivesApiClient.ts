import config from '../config'
import RestClient from './restClient'
import { IncentivesApiClient } from './interfaces/incentivesApiClient'
import { IncentiveReviewSummary } from '../interfaces/IncentivesApi/incentiveReviews'
import { mapToQueryString } from '../utils/utils'

export default class IncentivesApiRestClient implements IncentivesApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Incentives API', config.apis.incentivesApi, token)
  }

  async getReviewSummary(bookingId: number, withDetails: boolean = false): Promise<IncentiveReviewSummary> {
    return this.restClient.get<IncentiveReviewSummary>({
      path: `/incentive-reviews/booking/${bookingId}`,
      query: mapToQueryString({ withDetails }),
      ignore404: true,
    })
  }
}
