import config from '../config'
import { NonAssociationsApiClient } from './interfaces/nonAssociationsApiClient'
import RestClient from './restClient'
import { mapToQueryString } from '../utils/utils'
import { PrisonerNonAssociations } from '../interfaces/nonAssociationsApi/prisonerNonAssociations'

export default class NonAssociationsApiRestClient implements NonAssociationsApiClient {
  private restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Non associations API', config.apis.nonAssociationsApi, token)
  }

  getPrisonerNonAssociations(
    prisonerNumber: string,
    params?: {
      includeOpen?: 'true' | 'false'
      includeClosed?: 'true' | 'false'
      includeOtherPrisons?: 'true' | 'false'
    },
  ): Promise<PrisonerNonAssociations> {
    return this.restClient.get<PrisonerNonAssociations>({
      path: `/prisoner/${prisonerNumber}/non-associations`,
      query: mapToQueryString(params),
    })
  }
}
