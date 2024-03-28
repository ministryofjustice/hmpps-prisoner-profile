import { RedisClient } from './redisClient'
import TokenStore from './tokenStore'

const redisClient = {
  get: jest.fn(),
  set: jest.fn(),
  on: jest.fn(),
  connect: jest.fn(),
  isOpen: true,
}

describe('tokenStore', () => {
  let tokenStore: TokenStore

  beforeEach(() => {
    tokenStore = new TokenStore(redisClient as unknown as RedisClient)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('get token', () => {
    it('should get token given connection already established', async () => {
      // Given
      redisClient.isOpen = true

      const userToken = 'token-1'
      redisClient.get.mockResolvedValue(userToken)

      // When
      const actual = await tokenStore.getToken('user-1')

      // Then
      expect(actual).toEqual(userToken)
      expect(redisClient.get).toHaveBeenCalledWith('user-1')
      expect(redisClient.connect).not.toHaveBeenCalled()
    })

    it('should get token given connection not already established', async () => {
      redisClient.isOpen = false

      const userToken = 'token-1'
      redisClient.get.mockResolvedValue(userToken)

      // When
      const actual = await tokenStore.getToken('user-1')

      // Then
      expect(actual).toEqual(userToken)
      expect(redisClient.get).toHaveBeenCalledWith('user-1')
      expect(redisClient.connect).toHaveBeenCalled()
    })
  })

  describe('set token', () => {
    it('should set token given connection already established', async () => {
      // Given
      redisClient.isOpen = true
      redisClient.set.mockResolvedValue(null)

      // When
      await tokenStore.setToken('user-1', 'token-1', 10)

      // Then
      expect(redisClient.set).toHaveBeenCalledWith('user-1', 'token-1', { EX: 10 })
      expect(redisClient.connect).not.toHaveBeenCalled()
    })

    it('should set token given connection not already established', async () => {
      // Given
      redisClient.isOpen = false
      redisClient.set.mockResolvedValue(null)

      // When
      await tokenStore.setToken('user-1', 'token-1', 10)

      // Then
      expect(redisClient.set).toHaveBeenCalledWith('user-1', 'token-1', { EX: 10 })
      expect(redisClient.connect).toHaveBeenCalled()
    })
  })
})
