import { DietAndAllergy, HealthAndMedication } from '../interfaces/healthAndMedicationApi/healthAndMedicationApiClient'

export const dietAndAllergyMock: DietAndAllergy = {
  foodAllergies: {
    value: [{ value: { id: 'FOOD_ALLERGY_GLUTEN', description: 'Gluten', listSequence: 0, isActive: true } }],
    lastModifiedAt: '2024-07-01T01:02:03+0100',
    lastModifiedBy: 'USER1',
  },
  medicalDietaryRequirements: {
    value: [
      {
        value: {
          id: 'MEDICAL_DIET_LOW_FAT',
          description: 'Low fat',
          listSequence: 0,
          isActive: true,
        },
      },
    ],
    lastModifiedAt: '2024-07-01T01:02:03+0100',
    lastModifiedBy: 'USER1',
  },
  personalisedDietaryRequirements: {
    value: [],
    lastModifiedAt: '2024-07-01T01:02:03+0100',
    lastModifiedBy: 'USER1',
  },
}

export const healthMock: HealthAndMedication = {
  dietAndAllergy: dietAndAllergyMock,
}
