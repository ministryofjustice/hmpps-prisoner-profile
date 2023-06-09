import UserService from './userService'
import HmppsAuthClient, { User } from '../data/hmppsAuthClient'

import PrisonApiClient from '../data/prisonApiClient'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import { LocationDummyDataB } from '../data/localMockData/locations'

const token = 'some token'
const prisonApiClient = prisonApiClientMock()
const MockedPrisonApiClient = PrisonApiClient as jest.Mock<PrisonApiClient>

jest.mock('../data/prisonApiClient')
jest.mock('../data/hmppsAuthClient')

describe('User service', () => {
  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>
  let userService: UserService

  describe('getUser', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
      hmppsAuthClient.getUser.mockResolvedValue({ name: 'john smith' } as User)

      MockedPrisonApiClient.mockImplementation(_ => prisonApiClient as PrisonApiClient)
      prisonApiClient.getUserCaseLoads = jest.fn(async () => [])
      prisonApiClient.getUserLocations = jest.fn(async () => [])

      userService = new UserService(hmppsAuthClient)
    })

    it('Retrieves and formats user name', async () => {
      const result = await userService.getUser(token)
      expect(result.displayName).toEqual('John Smith')
    })

    it('Retrieves user caseloads', async () => {
      prisonApiClient.getUserCaseLoads = jest.fn(async () => CaseLoadsDummyDataA)

      const result = await userService.getUser(token)
      expect(result.caseLoads).toEqual(CaseLoadsDummyDataA)
    })

    it('Retrieves user locations', async () => {
      prisonApiClient.getUserLocations = jest.fn(async () => LocationDummyDataB)

      const result = await userService.getUser(token)
      expect(result.locations).toEqual(LocationDummyDataB)
    })

    it('Propagates error', async () => {
      hmppsAuthClient.getUser.mockRejectedValue(new Error('some error'))

      await expect(userService.getUser(token)).rejects.toEqual(new Error('some error'))
    })
  })
})
