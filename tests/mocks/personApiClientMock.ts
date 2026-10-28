import type { DpsPersonRecord, PersonApiClient } from '../../server/data/interfaces/personApi'
import { personApiReligionCodesMock } from '../../server/data/localMockData/personApi/religionCodesMock'
import {
  mockPersonRecord,
  mockPersonRecordWithReligionHistory,
} from '../../server/data/localMockData/personApi/personRecordMock'

export const personApiClientMock = (): jest.Mocked<PersonApiClient> => ({
  getReligionCodes: jest.fn(_ => Promise.resolve(personApiReligionCodesMock)),
  getRecord: jest.fn((_, withReligionHistory) =>
    Promise.resolve(withReligionHistory ? mockPersonRecordWithReligionHistory : (mockPersonRecord as DpsPersonRecord)),
  ),
})

export default { personApiClientMock }
