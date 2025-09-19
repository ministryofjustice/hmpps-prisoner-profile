import RestClient from './restClient'
import config from '../config'
import CommunityManager from './interfaces/deliusApi/CommunityManager'
import { PrisonerProfileDeliusApiClient } from './interfaces/deliusApi/prisonerProfileDeliusApiClient'
import ProbationDocuments from './interfaces/deliusApi/ProbationDocuments'

export default class PrisonerProfileDeliusApiRestClient extends RestClient implements PrisonerProfileDeliusApiClient {
  constructor(token: string) {
    super('Prisoner Profile Delius API', config.apis.prisonerProfileDeliusApi, token)
  }

  async getCommunityManager(prisonerNumber: string): Promise<CommunityManager | null> {
    return this.getAndIgnore404({
      path: `/probation-cases/${prisonerNumber}/community-manager`,
    })
  }

  async getProbationDocuments(prisonerNumber: string): Promise<ProbationDocuments> {
    return this.get(
      {
        path: `/probation-cases/${prisonerNumber}/documents`,
      },
      this.token,
    )
  }
}
