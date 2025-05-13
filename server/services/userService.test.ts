import UserService from './userService'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import CaseLoad from '../data/interfaces/prisonApi/CaseLoad'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import { HmppsUser } from '../interfaces/HmppsUser'
import { prisonUserMock } from '../data/localMockData/user'

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

  describe('isUserAKeyWorker', () => {
    describe('when the user is a prison user', () => {
      it.each([true, false])(`returns result: '%s' from Prison API`, async response => {
        prisonApiClient.hasStaffRole = jest.fn(async () => response)

        const result = await userService.isUserAKeyWorker(token, prisonUserMock, 'MDI')

        expect(result).toEqual(response)
      })
    })

    describe('when the user is not a prison user', () => {
      it.each(['delius', 'external'])('should return false', async authSource => {
        const result = await userService.isUserAKeyWorker(token, { authSource } as HmppsUser, 'MDI')

        expect(result).toBeFalsy()
      })
    })
  })
})
