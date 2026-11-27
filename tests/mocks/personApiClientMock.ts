import type { PersonApiClient } from '../../server/data/interfaces/personApi'
import { personApiReligionCodesMock } from '../../server/data/localMockData/personApi/religionCodesMock'
import { mockPersonRecord, mockReligionHistory } from '../../server/data/localMockData/personApi/personRecordMock'

export const personApiClientMock = (): jest.Mocked<PersonApiClient> => ({
  getReligionCodes: jest.fn().mockResolvedValue(personApiReligionCodesMock),
  getRecord: jest.fn().mockResolvedValue(mockPersonRecord),
  getReligionHistory: jest.fn().mockResolvedValue(mockReligionHistory),
  updateReligion: jest.fn((_prisonerNumber, _request) => Promise.resolve()),
})

export default { personApiClientMock }
