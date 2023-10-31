import config from '../config'
import { NonAssociationDetails } from '../interfaces/nonAssociationDetails'
import { NonAssociationsApiClient } from './interfaces/nonAssociationsApiClient'
import nonAssociationDetailsDummyData from './localMockData/nonAssociations'
import RestClient from './restClient'

export default class NonAssociationsApiRestClient implements NonAssociationsApiClient {
  private restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Non associations API', config.apis.nonAssociationsApi, token)
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

  getNonAssociationDetails(prisonerNumber: string): Promise<NonAssociationDetails> {
    return this.get<NonAssociationDetails>(
      {
        path: `/legacy/api/offenders/${prisonerNumber}/non-association-details?currentPrisonOnly=true&excludeInactive=true`,
      },
      nonAssociationDetailsDummyData,
    )
  }
}
