import Interface from './Interface'
import PersonalPageService from '../../server/services/personalPageService'
import {
  HealthAndMedicationReferenceDataDomain,
  ReferenceDataCode,
} from '../../server/data/interfaces/healthAndMedicationApi/healthAndMedicationApiClient'

export const personalPageServiceMock = (): Interface<PersonalPageService> => ({
  get: jest.fn(),
  getLearnerNeurodivergence: jest.fn(),
  getPrisonPerson: jest.fn(),
  updatePhysicalAttributes: jest.fn(),
  getReferenceDataCodes: jest.fn(),
  getReferenceDataDomain: jest.fn(),
  updateSmokerOrVaper: jest.fn(),
  updateCityOrTownOfBirth: jest.fn(),
  updateNationality: jest.fn(),
  getDistinguishingMarks: jest.fn(),
  updateCountryOfBirth: jest.fn(),
  updateReligion: jest.fn(),
  getReferenceDataCodesFromProxy: jest.fn(),
  getReferenceDataFromProxy: jest.fn(),
  getHealthAndMedication: jest.fn(),
  updateDietAndFoodAllergies: jest.fn(),
  // TODO: Add reference data codes here so tests can use them
  getHealthAndMedicationReferenceDataCodes: jest.fn(
    async (code: HealthAndMedicationReferenceDataDomain): Promise<ReferenceDataCode[]> => {
      switch (code) {
        case HealthAndMedicationReferenceDataDomain.foodAllergy:
          return []
        case HealthAndMedicationReferenceDataDomain.medicalDiet:
          return []
        case HealthAndMedicationReferenceDataDomain.personalisedDiet:
          return []
        default:
          return []
      }
    },
  ),
  getMilitaryRecords: jest.fn(),
})
