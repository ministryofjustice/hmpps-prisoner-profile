import { NonAssociationDetails } from '../../interfaces/nonAssociationDetails'

export interface NonAssociationsApiClient {
  getNonAssociationDetails(prisonerNumber: string): Promise<NonAssociationDetails>
}
