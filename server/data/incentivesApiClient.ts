import config from '../config'
import RestClient from './restClient'
import { IncentivesApiClient } from './interfaces/incentivesApi/incentivesApiClient'
import IncentiveReviews from './interfaces/incentivesApi/IncentiveReviews'

export default class IncentivesApiRestClient extends RestClient implements IncentivesApiClient {
  constructor(token: string) {
    super('Incentives API', config.apis.incentivesApi, token)
  }

  async getReviews(prisonerNumber: string): Promise<IncentiveReviews | null> {
    return this.getAndIgnore404({
      path: `/incentive-reviews/prisoner/${prisonerNumber}`,
    })
  }
}
