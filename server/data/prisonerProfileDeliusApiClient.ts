import RestClient from './restClient'
import config from '../config'
import { CommunityManager } from '../interfaces/prisonerProfileDeliusApi/communityManager'
import { PrisonerProfileDeliusApiClient } from './interfaces/prisonerProfileDeliusApiClient'

export default class PrisonerProfileDeliusApiRestClient implements PrisonerProfileDeliusApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Prisoner Profile Delius API', config.apis.prisonerProfileDeliusApi, token)
  }

  async getCommunityManager(prisonerNumber: string): Promise<CommunityManager | null> {
    return this.restClient.get<CommunityManager | null>({
      path: `/probation-cases/${prisonerNumber}/community-manager`,
      ignore404: true,
    })
  }
}