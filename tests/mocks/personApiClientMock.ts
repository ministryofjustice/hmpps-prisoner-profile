import type { PersonApiClient } from '../../server/data/interfaces/personApi'
import { mockPersonRecord } from '../../server/data/localMockData/personApi/personRecordMock'

export const personApiClientMock = (): jest.Mocked<PersonApiClient> => ({
  getRecord: jest.fn(_ => Promise.resolve(mockPersonRecord)),
})

export default { personApiClientMock }
