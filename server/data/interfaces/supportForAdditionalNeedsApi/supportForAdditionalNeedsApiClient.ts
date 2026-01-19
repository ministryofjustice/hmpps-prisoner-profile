import type { HasNeed } from './SupportForAdditionalNeeds'

export interface SupportForAdditionalNeedsApiClient {
  hasNeedsForAdditionalSupport(prisonerNumber: string): Promise<HasNeed>
}
