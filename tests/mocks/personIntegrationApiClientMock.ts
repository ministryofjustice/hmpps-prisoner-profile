import { PersonIntegrationApiClient } from '../../server/data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { MilitaryRecordsMock } from '../../server/data/localMockData/personIntegrationApiReferenceDataMock'
import { corePersonPhysicalAttributesDtoMock } from '../../server/data/localMockData/physicalAttributesMock'

export const personIntegrationApiClientMock = (): PersonIntegrationApiClient => ({
  updateBirthPlace: jest.fn(),
  updateCountryOfBirth: jest.fn(),
  updateNationality: jest.fn(),
  updateReligion: jest.fn(),
  getReferenceDataCodes: jest.fn(),
  getMilitaryRecords: jest.fn(async () => MilitaryRecordsMock),
  updateMilitaryRecord: jest.fn(),
  createMilitaryRecord: jest.fn(),
  getPhysicalAttributes: jest.fn(async () => corePersonPhysicalAttributesDtoMock),
  updatePhysicalAttributes: jest.fn(),
  getDistinguishingMark: jest.fn(),
  getDistinguishingMarks: jest.fn(),
  createDistinguishingMark: jest.fn(),
  updateDistinguishingMark: jest.fn(),
  getDistinguishingMarkImage: jest.fn(),
  updateDistinguishingMarkImage: jest.fn(),
  addDistinguishingMarkImage: jest.fn(),
  updateProfileImage: jest.fn(),
  getPseudonyms: jest.fn(),
  createPseudonym: jest.fn(),
  updatePseudonym: jest.fn(),
  updateSexualOrientation: jest.fn(),
})
