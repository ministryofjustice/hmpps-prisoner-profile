import UserService from './userService'
import HmppsAuthClient, { User } from '../data/hmppsAuthClient'

import PrisonApiClient from '../data/prisonApiClient'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'

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

      userService = new UserService(() => hmppsAuthClient)
    })

    it('Retrieves and formats user name', async () => {
      const result = await userService.getUser(token)
      expect(result.displayName).toEqual('John Smith')
    })

    it('Propagates error', async () => {
      hmppsAuthClient.getUser.mockRejectedValue(new Error('some error'))

      await expect(userService.getUser(token)).rejects.toEqual(new Error('some error'))
    })
  })
})
