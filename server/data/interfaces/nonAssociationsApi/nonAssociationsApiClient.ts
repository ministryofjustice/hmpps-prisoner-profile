import CircuitBreaker from 'opossum'
import PrisonerNonAssociations from './PrisonerNonAssociations'

export interface NonAssociationsApiClient {
  breaker: CircuitBreaker
  getPrisonerNonAssociations(
    prisonerNumber: string,
    params?: {
      includeOpen?: 'true' | 'false'
      includeClosed?: 'true' | 'false'
      includeOtherPrisons?: 'true' | 'false'
    },
  ): Promise<PrisonerNonAssociations>
}
