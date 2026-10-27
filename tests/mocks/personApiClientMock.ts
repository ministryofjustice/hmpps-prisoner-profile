import type { PersonApiClient } from '../../server/data/interfaces/personApi'
import { personApiReligionCodesMock } from '../../server/data/localMockData/personApi/religionCodesMock'
import { mockPersonRecord } from '../../server/data/localMockData/personApi/personRecordMock'

export const personApiClientMock = (): jest.Mocked<PersonApiClient> => ({
  getReligionCodes: jest.fn(_ => Promise.resolve(personApiReligionCodesMock)),
  getRecord: jest.fn(_ => Promise.resolve(mockPersonRecord)),
})

export default { personApiClientMock }
