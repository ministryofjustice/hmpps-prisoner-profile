import { CorePersonRecordReferenceDataDomain } from './personIntegrationApi/personIntegrationApiClient'
import { HealthAndMedicationReferenceDataDomain } from './healthAndMedicationApi/healthAndMedicationApiClient'
import { PersonCommunicationNeedsReferenceDataDomain } from './personCommunicationNeedsApi/personCommunicationNeedsApiClient'

export interface ReferenceDataCodeDto {
  id: string
  code: string
  description: string
  listSequence: number
  isActive: boolean
  parentCode?: string
}

export type ReferenceDataDomain =
  | CorePersonRecordReferenceDataDomain
  | HealthAndMedicationReferenceDataDomain
  | PersonCommunicationNeedsReferenceDataDomain
