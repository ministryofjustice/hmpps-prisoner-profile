import UserService from './userService'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import CaseLoad from '../data/interfaces/prisonApi/CaseLoad'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import { HmppsUser } from '../interfaces/HmppsUser'

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
    describe('when the user is a prison user', () => {
      it('should retrieve and return staff roles from prison api', async () => {
        prisonApiClient.getStaffRoles = jest.fn(async () => [{ role: 'role1' }, { role: 'role2' }])

        const result = await userService.getStaffRoles(token, {
          authSource: 'nomis',
          staffId: 1,
          activeCaseLoadId: 'MDI',
        } as HmppsUser)

        expect(result).toEqual([{ role: 'role1' }, { role: 'role2' }])
      })
    })

    describe('when the user is not a prison user', () => {
      it.each(['delius', 'external'])('should return an empty list', async authSource => {
        const result = await userService.getStaffRoles(token, { authSource } as HmppsUser)

        expect(result).toEqual([])
      })
    })

    describe('when the user does not have an active caseload', () => {
      it('should return an empty list', async () => {
        const result = await userService.getStaffRoles(token, {
          authSource: 'nomis',
          staffId: 1,
          activeCaseLoadId: undefined,
        } as HmppsUser)

        expect(result).toEqual([])
      })
    })
  })
})
