import UserService from './userService'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import CaseLoad from '../data/interfaces/prisonApi/CaseLoad'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'

const token = 'some token'

describe('HmppsUser service', () => {
  let prisonApiClient: PrisonApiClient
  let userService: UserService
  let expectedCaseLoads: CaseLoad[]

  beforeEach(() => {
    prisonApiClient = prisonApiClientMock()
    expectedCaseLoads = [{ caseloadFunction: '', caseLoadId: '1', currentlyActive: true, description: '', type: '' }]
    prisonApiClient.getUserCaseLoads = jest.fn(async () => expectedCaseLoads)

    userService = new UserService(() => prisonApiClient)
  })

  describe('getStaffRoles', () => {
    it('should retrieve and return staff roles from prison api', async () => {
      prisonApiClient.getStaffRoles = jest.fn(async () => [{ role: 'role1' }, { role: 'role2' }])

      const result = await userService.getStaffRoles(token, 1, 'agency')
      expect(result).toEqual([{ role: 'role1' }, { role: 'role2' }])
    })
  })
})
