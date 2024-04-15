import UserService from './userService'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import CaseLoad from '../data/interfaces/prisonApi/CaseLoad'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import { ManageUsersApiClient } from '../data/interfaces/manageUsersApi/manageUsersApiClient'
import ManageUsersApiRestClient from '../data/manageUsersApiClient'
import { User } from '../data/interfaces/manageUsersApi/User'

const token = 'some token'

jest.mock('../data/manageUsersApiClient')

describe('User service', () => {
  let manageUsersApiClient: jest.Mocked<ManageUsersApiClient>
  let prisonApiClient: PrisonApiClient
  let userService: UserService
  let expectedCaseLoads: CaseLoad[]

  beforeEach(() => {
    manageUsersApiClient = new ManageUsersApiRestClient(null) as jest.Mocked<ManageUsersApiRestClient>
    manageUsersApiClient.getUser.mockResolvedValue({ name: 'john smith' } as User)

    prisonApiClient = prisonApiClientMock()
    expectedCaseLoads = [{ caseloadFunction: '', caseLoadId: '1', currentlyActive: true, description: '', type: '' }]
    prisonApiClient.getUserCaseLoads = jest.fn(async () => expectedCaseLoads)

    userService = new UserService(
      () => manageUsersApiClient,
      () => prisonApiClient,
    )
  })

  describe('getUser', () => {
    it('Retrieves and formats user name', async () => {
      const result = await userService.getUser(token)
      expect(result.displayName).toEqual('John Smith')
    })

    it('Retrieves case loads', async () => {
      const result = await userService.getUserCaseLoads(token)
      expect(result).toEqual(expectedCaseLoads)
    })

    it('Propagates error', async () => {
      manageUsersApiClient.getUser.mockRejectedValue(new Error('some error'))

      await expect(userService.getUser(token)).rejects.toEqual(new Error('some error'))
    })
  })

  describe('getStaffRoles', () => {
    it('should retrieve and return staff roles from prison api', async () => {
      prisonApiClient.getStaffRoles = jest.fn(async () => [{ role: 'role1' }, { role: 'role2' }])

      const result = await userService.getStaffRoles(token, 1, 'agency')
      expect(result).toEqual([{ role: 'role1' }, { role: 'role2' }])
    })
  })
})
