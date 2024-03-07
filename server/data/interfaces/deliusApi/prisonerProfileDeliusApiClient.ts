import ProbationDocuments from './ProbationDocuments'
import CommunityManager from './CommunityManager'

export interface PrisonerProfileDeliusApiClient {
  getCommunityManager(prisonerNumber: string): Promise<CommunityManager | null>
  getProbationDocuments(prisonerNumber: string): Promise<ProbationDocuments>
}
