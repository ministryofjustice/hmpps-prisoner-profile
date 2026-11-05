import type { ManageUsersApiClient } from '../../server/data/interfaces/manageUsersApi'
import { mockPrisonUser } from '../../server/data/localMockData/manageUsersMock'

export const manageUsersApiClientMock = (): jest.Mocked<ManageUsersApiClient> => ({
  getPrisonUser: jest.fn(_ => Promise.resolve(mockPrisonUser)),
})

export default { manageUsersApiClientMock }
