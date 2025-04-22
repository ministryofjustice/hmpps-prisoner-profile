import { CorePersonRecordReferenceDataDomain } from './personIntegrationApi/personIntegrationApiClient'
import { HealthAndMedicationReferenceDataDomain } from './healthAndMedicationApi/healthAndMedicationApiClient'
import { PersonCommunicationNeedsReferenceDataDomain } from './personCommunicationNeedsApi/personCommunicationNeedsApiClient'
import { PersonalRelationshipsReferenceDataDomain } from './personalRelationshipsApi/personalRelationshipsApiClient'

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
  | PersonalRelationshipsReferenceDataDomain
