import UserService from './userService'
import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import CaseLoad from '../data/interfaces/prisonApi/CaseLoad'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'

const token = 'some token'

jest.mock('../data/hmppsAuthClient')

describe('User service', () => {
  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>
  let prisonApiClient: PrisonApiClient
  let userService: UserService
  let expectedCaseLoads: CaseLoad[]

  beforeEach(() => {
    hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
    hmppsAuthClient.getUser.mockResolvedValue({ name: 'john smith' } as User)

    prisonApiClient = prisonApiClientMock()
    expectedCaseLoads = [{ caseloadFunction: '', caseLoadId: '1', currentlyActive: true, description: '', type: '' }]
    prisonApiClient.getUserCaseLoads = jest.fn(async () => expectedCaseLoads)

    userService = new UserService(
      () => hmppsAuthClient,
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
      hmppsAuthClient.getUser.mockRejectedValue(new Error('some error'))

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
