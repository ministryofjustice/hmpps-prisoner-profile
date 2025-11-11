import config from '../config'
import { NonAssociationsApiClient } from './interfaces/nonAssociationsApi/nonAssociationsApiClient'
import RestClient from './restClient'
import { mapToQueryString } from '../utils/utils'
import PrisonerNonAssociations from './interfaces/nonAssociationsApi/PrisonerNonAssociations'

export default class NonAssociationsApiRestClient extends RestClient implements NonAssociationsApiClient {
  constructor(token: string) {
    super('Non associations API', config.apis.nonAssociationsApi, token)
  }

  getPrisonerNonAssociations(
    prisonerNumber: string,
    params?: {
      includeOpen?: 'true' | 'false'
      includeClosed?: 'true' | 'false'
      includeOtherPrisons?: 'true' | 'false'
    },
  ): Promise<PrisonerNonAssociations> {
    return this.get(
      {
        path: `/prisoner/${prisonerNumber}/non-associations`,
        query: mapToQueryString(params),
      },
      this.token,
    )
  }
}
