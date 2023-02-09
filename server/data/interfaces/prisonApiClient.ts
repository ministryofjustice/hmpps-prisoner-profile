import { CaseLoad } from '../../interfaces/caseLoad'
import { Location } from '../../interfaces/location'
import { NonAssociationDetails } from '../../interfaces/nonAssociationDetails'

export interface PrisonApiClient {
  getUserLocations(): Promise<Location[]>
  getUserCaseLoads(): Promise<CaseLoad[]>
  getNonAssociationDetails(prisonerNumber: string): Promise<NonAssociationDetails>
}
