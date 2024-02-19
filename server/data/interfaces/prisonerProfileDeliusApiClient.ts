import { ProbationDocuments } from '../../interfaces/deliusApi/probationDocuments'
import { CommunityManager } from '../../interfaces/prisonerProfileDeliusApi/communityManager'

export interface PrisonerProfileDeliusApiClient {
  getCommunityManager(prisonerNumber: string): Promise<CommunityManager | null>
  getProbationDocuments(prisonerNumber: string): Promise<ProbationDocuments>
}
