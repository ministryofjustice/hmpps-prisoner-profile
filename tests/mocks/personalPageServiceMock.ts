import type Interface from './Interface'
import type PersonalPageService from '../../server/services/personalPageService'
import { getMockReferenceDataCodesForDomain } from './referenceDataMocks'

export const personalPageServiceMock = (): jest.Mocked<PersonalPageService> =>
  ({
    get: jest.fn(),
    getLearnerNeurodivergence: jest.fn(),
    updatePhysicalAttributes: jest.fn(),
    updateSmokerOrVaper: jest.fn(),
    updateCityOrTownOfBirth: jest.fn(),
    updateNationality: jest.fn(),
    getDistinguishingMarks: jest.fn(),
    updateCountryOfBirth: jest.fn(),
    getReligionOrBelief: jest.fn(),
    updateReligion: jest.fn(),
    updateSexualOrientation: jest.fn(),
    getReferenceDataCodes: jest.fn(async (_, domain) => getMockReferenceDataCodesForDomain(domain)),
    getReferenceData: jest.fn(),
    getHealthAndMedication: jest.fn(),
    updateDietAndFoodAllergies: jest.fn(),
    getMilitaryRecords: jest.fn(),
    getPhysicalAttributes: jest.fn(),
    getNumberOfChildren: jest.fn(),
    updateNumberOfChildren: jest.fn(),
    getDomesticStatus: jest.fn(),
    getDomesticStatusReferenceData: jest.fn(),
    updateDomesticStatus: jest.fn(),
    getNextOfKinAndEmergencyContacts: jest.fn(),
    getGlobalPhonesAndEmails: jest.fn(),
    createGlobalEmail: jest.fn(),
    updateGlobalEmail: jest.fn(),
    createGlobalPhoneNumber: jest.fn(),
    updateGlobalPhoneNumber: jest.fn(),
  }) satisfies Interface<PersonalPageService> as unknown as jest.Mocked<PersonalPageService>

export default { personalPageServiceMock }
