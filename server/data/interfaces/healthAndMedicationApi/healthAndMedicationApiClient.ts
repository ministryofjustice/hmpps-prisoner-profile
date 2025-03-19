// eslint-disable-next-line no-shadow
export enum HealthAndMedicationReferenceDataDomain {
  foodAllergy = 'FOOD_ALLERGY',
  medicalDiet = 'MEDICAL_DIET',
  personalisedDiet = 'PERSONALISED_DIET',
  smoker = 'SMOKER',
}

export interface ValueWithMetadata<T> {
  value?: T
  lastModifiedAt: string
  lastModifiedBy: string
  lastModifiedPrisonId: string
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

export interface ReferenceDataValue {
  id: string
  code: string
  description: string
}

export interface ReferenceDataSelection {
  value: ReferenceDataValue
  comment?: string
}

export interface ReferenceDataIdSelection {
  value: string
  comment?: string
}

export interface DietAndAllergy {
  foodAllergies: ValueWithMetadata<ReferenceDataSelection[]>
  medicalDietaryRequirements: ValueWithMetadata<ReferenceDataSelection[]>
  personalisedDietaryRequirements: ValueWithMetadata<ReferenceDataSelection[]>
  cateringInstructions?: ValueWithMetadata<string>
}

export interface HealthAndMedication {
  dietAndAllergy?: DietAndAllergy
}

export interface DietAndAllergyUpdate {
  foodAllergies?: ReferenceDataIdSelection[]
  medicalDietaryRequirements?: ReferenceDataIdSelection[]
  personalisedDietaryRequirements?: ReferenceDataIdSelection[]
  cateringInstructions?: string
}

export interface SmokerStatusUpdate {
  smokerStatus?: string
}

export interface HealthAndMedicationApiClient {
  getReferenceDataCodes(
    domain: HealthAndMedicationReferenceDataDomain,
    includeInactive?: boolean,
  ): Promise<ReferenceDataCode[]>

  getHealthAndMedication(prisonerNumber: string): Promise<HealthAndMedication>

  updateDietAndAllergyData(
    prisonerNumber: string,
    dietAndAllergyUpdate: Partial<DietAndAllergyUpdate>,
  ): Promise<DietAndAllergy>

  updateSmokerStatus(prisonerNumber: string, smokerStatusUpdate: Partial<SmokerStatusUpdate>): Promise<void>
}
