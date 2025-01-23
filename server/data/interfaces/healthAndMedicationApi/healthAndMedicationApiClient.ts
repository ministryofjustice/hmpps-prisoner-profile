export interface ValueWithMetadata<T> {
  value?: T
  lastModifiedAt: string
  lastModifiedBy: string
}

export interface ReferenceDataDomain {
  code: string
  description: string
  listSequence: number
  createdAt: string
  createdBy: string
  isActive: boolean
  lastModifiedAt?: string
  lastModifiedBy?: string
  deactivatedAt?: string
  deactivatedBy?: string
  referenceDataCodes?: ReferenceDataCode[]
  subDomains: ReferenceDataDomain[]
}

export interface ReferenceDataCode {
  id: string
  domain: string
  code: string
  description: string
  listSequence: number
  createdAt: string
  createdBy: string
  isActive: boolean
  lastModifiedAt?: string
  lastModifiedBy?: string
  deactivatedAt?: string
  deactivatedBy?: string
}

export interface ReferenceDataCodeSimple {
  id: string
  description: string
  listSequence: number
  isActive: boolean
}

export interface FieldHistory {
  valueInt: number
  valueString: string
  valueRef: ReferenceDataCodeSimple
  appliesFrom: string
  appliesTo: string
  createdBy: string
  source: string
}

export interface HealthAndMedication {
  smokerOrVaper: ValueWithMetadata<ReferenceDataCodeSimple>
  foodAllergies: ValueWithMetadata<ReferenceDataCodeSimple[]>
  medicalDietaryRequirements: ValueWithMetadata<ReferenceDataCodeSimple[]>
}

export interface HealthAndMedicationUpdate {
  smokerOrVaper?: string
  foodAllergies?: string[]
  medicalDietaryRequirements?: string[]
}

export interface HealthAndMedicationApiClient {
  getHealthAndMedicationForPrisoner(prisonerNumber: string): Promise<HealthAndMedication>
  updateHealthAndMedicationForPrisoner(
    prisonerNumber: string,
    healthData: Partial<HealthAndMedicationUpdate>,
  ): Promise<HealthAndMedication>
}
