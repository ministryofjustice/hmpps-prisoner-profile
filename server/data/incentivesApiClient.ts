import CircuitBreaker from 'opossum'
import config from '../config'
import RestClient, { Request } from './restClient'
import { IncentivesApiClient } from './interfaces/incentivesApi/incentivesApiClient'
import IncentiveReviews from './interfaces/incentivesApi/IncentiveReviews'

export default class IncentivesApiRestClient extends RestClient implements IncentivesApiClient {
  constructor(token: string, circuitBreaker?: CircuitBreaker<[Request<unknown, unknown>, string], unknown>) {
    super('Incentives API', config.apis.incentivesApi, token, circuitBreaker)
  }

  async getReviews(prisonerNumber: string): Promise<IncentiveReviews | null> {
    return this.getAndIgnore404({
      path: `/incentive-reviews/prisoner/${prisonerNumber}`,
    })
  }
}
