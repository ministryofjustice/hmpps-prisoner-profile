import config from '../config'
import { NonAssociationDetails } from '../interfaces/nonAssociationDetails'
import { NonAssociationsApiClient } from './interfaces/nonAssociationsApiClient'
import RestClient from './restClient'

export default class NonAssociationsApiRestClient implements NonAssociationsApiClient {
  private restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Non associations API', config.apis.nonAssociationsApi, token)
  }

  getNonAssociationDetails(prisonerNumber: string): Promise<NonAssociationDetails> {
    return this.restClient.get<NonAssociationDetails>({
      path: `/legacy/api/offenders/${prisonerNumber}/non-association-details?currentPrisonOnly=true&excludeInactive=true`,
    })
  }
}
