import { CommunityManager } from '../../interfaces/prisonerProfileDeliusApi/communityManager'

export interface PrisonerProfileDeliusApiClient {
  getCommunityManager(prisonerNumber: string): Promise<CommunityManager | null>
}
