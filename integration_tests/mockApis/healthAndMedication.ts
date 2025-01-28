import { HealthAndMedication } from '../../server/data/interfaces/healthAndMedicationApi/healthAndMedicationApiClient'
import { stubGetWithBody, stubPatchWithResponse } from './utils'

const mockHealthAndMedication = (): HealthAndMedication => ({
  dietAndAllergy: {
    foodAllergies: {
      value: [{ value: { id: 'FOOD_ALLERGY_EGG', description: 'Egg', isActive: true, listSequence: 0 } }],
      lastModifiedAt: '2024-07-01T01:02:03+0100',
      lastModifiedBy: 'USER1',
    },
    medicalDietaryRequirements: {
      value: [
        {
          value: {
            id: 'MEDICAL_DIET_LOW_FAT',
            description: 'Low fat',
            isActive: true,
            listSequence: 0,
          },
        },
      ],
      lastModifiedAt: '2024-07-01T01:02:03+0100',
      lastModifiedBy: 'USER1',
    },
    personalisedDietaryRequirements: {
      value: [
        {
          value: {
            id: 'PERSONALISED_DIET_VEGAN',
            description: 'Vegan',
            isActive: true,
            listSequence: 0,
          },
        },
      ],
      lastModifiedAt: '2024-07-01T01:02:03+0100',
      lastModifiedBy: 'USER1',
    },
  },
})

const baseUrl = '/healthAndMedication'

export default {
  stubHealthAndMedication: ({
    prisonerNumber,
    overrides = {},
  }: {
    prisonerNumber: string
    overrides: Partial<HealthAndMedication>
  }) =>
    stubGetWithBody({
      path: `${baseUrl}/prisoners/${prisonerNumber}`,
      body: {
        ...mockHealthAndMedication(),
        ...overrides,
      },
    }),

  // PATCH routes
  stubHealthAndMedicationUpdate: ({
    prisonerNumber,
    overrides = {},
  }: {
    prisonerNumber: string
    overrides: Partial<HealthAndMedication>
  }) =>
    stubPatchWithResponse<HealthAndMedication>({
      path: `${baseUrl}/prisoners/${prisonerNumber}`,
      responseBody: {
        ...mockHealthAndMedication(),
        ...overrides,
      },
    }),
}
