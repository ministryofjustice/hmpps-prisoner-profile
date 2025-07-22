import config from '../config'
import RestClient from './restClient'
import { IncentivesApiClient } from './interfaces/incentivesApi/incentivesApiClient'
import IncentiveReviews from './interfaces/incentivesApi/IncentiveReviews'

export default class IncentivesApiRestClient implements IncentivesApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Incentives API', config.apis.incentivesApi, token)
  }

  async getReviews(prisonerNumber: string): Promise<IncentiveReviews> {
    return this.restClient.get<IncentiveReviews>({
      path: `/incentive-reviews/prisoner/${prisonerNumber}`,
      ignore404: true,
    })
  }
}
