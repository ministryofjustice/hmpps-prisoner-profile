import { PrisonPersonHealth } from '../interfaces/prisonPersonApi/prisonPersonApiClient'

export const healthMock: PrisonPersonHealth = {
  smokerOrVaper: {
    value: { id: 'SMOKE_SMOKER', description: 'Yes they smoke', listSequence: 0, isActive: true },
    lastModifiedAt: '2024-07-01T01:02:03+0100',
    lastModifiedBy: 'USER1',
  },
  foodAllergies: {
    value: [{ id: 'FOOD_ALLERGY_GLUTEN', description: 'Gluten', listSequence: 0, isActive: true }],
    lastModifiedAt: '2024-07-01T01:02:03+0100',
    lastModifiedBy: 'USER1',
  },
  medicalDietaryRequirements: {
    value: [
      {
        id: 'MEDICAL_DIET_LOW_FAT',
        description: 'Low fat',
        listSequence: 0,
        isActive: true,
      },
    ],
    lastModifiedAt: '2024-07-01T01:02:03+0100',
    lastModifiedBy: 'USER1',
  },
}
