import type { DpsPersonRecord, PersonApiClient } from '../../server/data/interfaces/personApi'
import { personApiReligionCodesMock } from '../../server/data/localMockData/personApi/religionCodesMock'
import {
  mockPersonRecord,
  mockPersonRecordWithReligionHistory,
  mockReligionHistory,
} from '../../server/data/localMockData/personApi/personRecordMock'

export const personApiClientMock = (): jest.Mocked<PersonApiClient> => ({
  getReligionCodes: jest.fn().mockResolvedValue(personApiReligionCodesMock),
  getRecord: jest.fn((_, withReligionHistory) =>
    Promise.resolve(withReligionHistory ? mockPersonRecordWithReligionHistory : (mockPersonRecord as DpsPersonRecord)),
  ),
  getReligionHistory: jest.fn().mockResolvedValue(mockReligionHistory),
  updateReligion: jest.fn((_prisonerNumber, _request) => Promise.resolve()),
})

export default { personApiClientMock }
