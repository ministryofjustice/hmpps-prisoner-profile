import {
  DietAndAllergy,
  HealthAndMedication,
  ReferenceDataCode,
} from '../../server/data/interfaces/healthAndMedicationApi/healthAndMedicationApiClient'
import { stubGetWithBody, stubPutWithResponse } from './utils'

const mockDietAndAllergy = (): DietAndAllergy => ({
  foodAllergies: {
    value: [{ value: { id: 'FOOD_ALLERGY_EGG', description: 'Egg', isActive: true, listSequence: 0 } }],
    lastModifiedAt: '2024-07-01T01:02:03+0100',
    lastModifiedBy: 'USER1',
  },
  medicalDietaryRequirements: {
    value: [
      {
        value: {
          id: 'MEDICAL_DIET_NUTRIENT_DEFICIENCY',
          description: 'Nutrient deficiency',
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
})

const mockHealthAndMedication = (): HealthAndMedication => ({
  dietAndAllergy: mockDietAndAllergy(),
})

const baseUrl = '/healthAndMedication'

export default {
  // GET routes
  stubHealthAndMedicationReferenceDataCodes: ({ domain, resp }: { domain: string; resp: ReferenceDataCode[] }) =>
    stubGetWithBody({
      path: `${baseUrl}/reference-data/domains/${domain}/codes\\?includeInactive=true`,
      body: resp,
    }),

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

  // PUT routes
  stubDietAndAllergyUpdate: ({
    prisonerNumber,
    overrides = {},
  }: {
    prisonerNumber: string
    overrides: Partial<HealthAndMedication>
  }) =>
    stubPutWithResponse<HealthAndMedication>({
      path: `${baseUrl}/prisoners/${prisonerNumber}/diet-and-allergy`,
      responseBody: {
        ...mockDietAndAllergy(),
        ...overrides,
      },
    }),

  stubSmokerStatusUpdate: ({ prisonerNumber }: { prisonerNumber: string }) =>
    stubPutWithResponse<void>({
      path: `${baseUrl}/prisoners/${prisonerNumber}/smoker`,
      responseBody: null,
    }),
}
