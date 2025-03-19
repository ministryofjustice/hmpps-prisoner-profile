import {
  DietAndAllergy,
  HealthAndMedication,
} from '../../interfaces/healthAndMedicationApi/healthAndMedicationApiClient'
import { foodAllergyCodesMock, medicalDietCodesMock, personalisedDietCodesMock } from './referenceDataMocks'

export const dietAndAllergyMock: DietAndAllergy = {
  foodAllergies: {
    value: [{ value: foodAllergyCodesMock[0] }],
    lastModifiedAt: '2024-07-01T01:02:03+0100',
    lastModifiedBy: 'USER1',
    lastModifiedPrisonId: 'STI',
  },
  medicalDietaryRequirements: {
    value: [
      {
        value: medicalDietCodesMock[0],
      },
    ],
    lastModifiedAt: '2024-07-01T01:02:03+0100',
    lastModifiedBy: 'USER1',
    lastModifiedPrisonId: 'STI',
  },
  personalisedDietaryRequirements: {
    value: [
      {
        value: personalisedDietCodesMock[0],
      },
    ],
    lastModifiedAt: '2024-07-01T01:02:03+0100',
    lastModifiedBy: 'USER1',
    lastModifiedPrisonId: 'STI',
  },
  cateringInstructions: {
    value: 'Some catering instructions.',
    lastModifiedAt: '2024-07-02T01:02:03+0100',
    lastModifiedBy: 'USER1',
    lastModifiedPrisonId: 'STI',
  },
}

export const healthAndMedicationMock: HealthAndMedication = {
  dietAndAllergy: dietAndAllergyMock,
}
