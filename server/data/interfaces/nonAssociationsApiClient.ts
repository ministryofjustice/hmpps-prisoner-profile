import { PrisonerNonAssociations } from '../../interfaces/nonAssociationsApi/prisonerNonAssociations'

export interface NonAssociationsApiClient {
  getPrisonerNonAssociations(
    prisonerNumber: string,
    params?: {
      includeOpen?: 'true' | 'false'
      includeClosed?: 'true' | 'false'
      includeOtherPrisons?: 'true' | 'false'
    },
  ): Promise<PrisonerNonAssociations>
}
