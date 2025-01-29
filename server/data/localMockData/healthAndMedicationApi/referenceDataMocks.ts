import { ReferenceDataCode } from '../../interfaces/healthAndMedicationApi/healthAndMedicationApiClient'

export const foodAllergyCodesMock: ReferenceDataCode[] = [
  {
    id: 'FOOD_ALLERGY_EGG',
    domain: 'FOOD_ALLERGY',
    code: 'EGG',
    description: 'Egg',
    listSequence: 0,
    isActive: true,
    createdAt: '2024-06-14T10:35:17+0100',
    createdBy: 'USER1234',
  },
  {
    id: 'FOOD_ALLERGY_OTHER',
    domain: 'FOOD_ALLERGY',
    code: 'OTHER',
    description: 'Other',
    listSequence: 1,
    isActive: true,
    createdAt: '2024-06-14T10:35:17+0100',
    createdBy: 'USER1234',
  },
]

export const medicalDietCodesMock: ReferenceDataCode[] = [
  {
    id: 'MEDICAL_DIET_COELIAC',
    domain: 'MEDICAL_DIET',
    code: 'COELIAC',
    description: 'Coeliac',
    listSequence: 0,
    isActive: true,
    createdAt: '2024-06-14T10:35:17+0100',
    createdBy: 'USER1234',
  },
  {
    id: 'MEDICAL_DIET_OTHER',
    domain: 'MEDICAL_DIET',
    code: 'OTHER',
    description: 'Other',
    listSequence: 1,
    isActive: true,
    createdAt: '2024-06-14T10:35:17+0100',
    createdBy: 'USER1234',
  },
]

export const personalisedDietCodesMock: ReferenceDataCode[] = [
  {
    id: 'PERSONALISED_DIET_VEGAN',
    domain: 'PERSONALISED_DIET',
    code: 'VEGAN',
    description: 'Vegan',
    listSequence: 0,
    isActive: true,
    createdAt: '2024-06-14T10:35:17+0100',
    createdBy: 'USER1234',
  },
  {
    id: 'PERSONALISED_DIET_OTHER',
    domain: 'PERSONALISED_DIET',
    code: 'OTHER',
    description: 'Other',
    listSequence: 1,
    isActive: true,
    createdAt: '2024-06-14T10:35:17+0100',
    createdBy: 'USER1234',
  },
]
