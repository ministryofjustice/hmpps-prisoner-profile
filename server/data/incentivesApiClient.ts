import config from '../config'
import RestClient from './restClient'
import { IncentivesApiClient } from './interfaces/incentivesApi/incentivesApiClient'
import IncentiveReviews from './interfaces/incentivesApi/IncentiveReviews'

export default class IncentivesApiRestClient extends RestClient implements IncentivesApiClient {
  constructor(token: string) {
    super('Incentives API', config.apis.incentivesApi, token)
  }

  async getReviews(prisonerNumber: string): Promise<IncentiveReviews> {
    return this.getAndIgnore404<IncentiveReviews>({
      path: `/incentive-reviews/prisoner/${prisonerNumber}`,
    })
  }
}
