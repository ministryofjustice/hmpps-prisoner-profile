import Interface from './Interface'
import PersonalPageService from '../../server/services/personalPageService'

export const personalPageServiceMock = (): Interface<PersonalPageService> => ({
  get: jest.fn(),
  getLearnerNeurodivergence: jest.fn(),
  getPrisonPerson: jest.fn(),
  updatePhysicalAttributes: jest.fn(),
  getReferenceDataCodesFromPrisonPersonApi: jest.fn(),
  updateSmokerOrVaper: jest.fn(),
  updateCityOrTownOfBirth: jest.fn(),
  updateNationality: jest.fn(),
  getDistinguishingMarks: jest.fn(),
  updateCountryOfBirth: jest.fn(),
  updateReligion: jest.fn(),
  getReferenceDataCodes: jest.fn(),
  getReferenceData: jest.fn(),
  getHealthAndMedication: jest.fn(),
  updateDietAndFoodAllergies: jest.fn(),
  getMilitaryRecords: jest.fn(),
})
