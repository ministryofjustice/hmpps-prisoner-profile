import RestClient from './restClient'
import config from '../config'
import CommunityManager from './interfaces/deliusApi/CommunityManager'
import { PrisonerProfileDeliusApiClient } from './interfaces/deliusApi/prisonerProfileDeliusApiClient'
import ProbationDocuments from './interfaces/deliusApi/ProbationDocuments'

export default class PrisonerProfileDeliusApiRestClient implements PrisonerProfileDeliusApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Prisoner Profile Delius API', config.apis.prisonerProfileDeliusApi, token)
  }

  async getCommunityManager(prisonerNumber: string): Promise<CommunityManager | null | undefined> {
    try {
      return await this.restClient.get<CommunityManager | null>({
        path: `/probation-cases/${prisonerNumber}/community-manager`,
        ignore404: true,
      })
    } catch (e) {
      return undefined
    }
  }

  getProbationDocuments = (prisonerNumber: string): Promise<ProbationDocuments> =>
    this.restClient.get<ProbationDocuments>({ path: `/probation-cases/${prisonerNumber}/documents` })
}
