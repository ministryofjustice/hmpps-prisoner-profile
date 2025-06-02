import CircuitBreaker from 'opossum'
import config from '../config'
import { NonAssociationsApiClient } from './interfaces/nonAssociationsApi/nonAssociationsApiClient'
import RestClient, { GetRequest } from './restClient'
import { mapToQueryString } from '../utils/utils'
import PrisonerNonAssociations from './interfaces/nonAssociationsApi/PrisonerNonAssociations'

export default class NonAssociationsApiRestClient implements NonAssociationsApiClient {
  private restClient: RestClient

  breaker: CircuitBreaker<[GetRequest], PrisonerNonAssociations>

  constructor(token: string) {
    this.restClient = new RestClient('Non associations API', config.apis.nonAssociationsApi, token)
    this.breaker = new CircuitBreaker(
      options => this.restClient.get<PrisonerNonAssociations>(options),
      config.apis.nonAssociationsApi.circuitBreaker,
    )
  }

  getPrisonerNonAssociations(
    prisonerNumber: string,
    params?: {
      includeOpen?: 'true' | 'false'
      includeClosed?: 'true' | 'false'
      includeOtherPrisons?: 'true' | 'false'
    },
  ): Promise<PrisonerNonAssociations> {
    return this.breaker.fire({
      path: `/prisoner/${prisonerNumber}/non-associations`,
      query: mapToQueryString(params),
    })
  }
}
