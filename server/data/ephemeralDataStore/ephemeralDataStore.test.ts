import { randomUUID } from 'crypto'
import { RedisClient } from '../redisClient'
import { EphemeralDataStore } from './ephemeralDataStore'

const redisClient = {
  on: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  connect: jest.fn(),
}

const key = randomUUID()
const dataObject = { some: { nested: 'data' } }
const ttlMinutes = 60

describe('Ephemeral Data Store', () => {
  let dataStore: EphemeralDataStore

  beforeEach(() => {
    dataStore = new EphemeralDataStore(redisClient as unknown as RedisClient)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('cacheData', () => {
    it('should cache data', async () => {
      redisClient.set.mockResolvedValue(null)

      const uuid = await dataStore.cacheData(dataObject, ttlMinutes)

      expect(uuid).toBeDefined()
      expect(redisClient.set).toHaveBeenCalledWith(
        `ephemeral:${uuid}`,
        JSON.stringify(dataObject),
        { EX: 3600 }, // 1 hour in seconds
      )
    })

    it('handles caching null data', async () => {
      redisClient.set.mockResolvedValue(null)

      const uuid = await dataStore.cacheData(null, ttlMinutes)

      expect(uuid).toBeDefined()
      expect(redisClient.set).toHaveBeenCalledWith(
        `ephemeral:${uuid}`,
        'null',
        { EX: 3600 }, // 1 hour in seconds
      )
    })
  })

  describe('getData', () => {
    it('should retrieve data by uuid', async () => {
      const data = JSON.stringify(dataObject)
      redisClient.get.mockResolvedValue(data)

      const returnedData = await dataStore.getData(key)

      expect(returnedData.key).toEqual(key)
      expect(returnedData.value).toEqual(dataObject)
      expect(redisClient.get).toHaveBeenCalledWith(`ephemeral:${key}`)
    })

    it('should get undefined response if no match in redis', async () => {
      redisClient.get.mockResolvedValue(undefined)

      const returnedData = await dataStore.getData(key)

      expect(returnedData).toBeUndefined()
      expect(redisClient.get).toHaveBeenCalledWith(`ephemeral:${key}`)
    })

    it('should retrieve null data', async () => {
      redisClient.get.mockResolvedValue('null')

      const returnedData = await dataStore.getData(key)

      expect(returnedData.key).toEqual(key)
      expect(returnedData.value).toEqual(null)
      expect(redisClient.get).toHaveBeenCalledWith(`ephemeral:${key}`)
    })

    it('should not get status given redis client throws an error', async () => {
      redisClient.get.mockRejectedValue('Redis error')

      try {
        await dataStore.getData(key)
      } catch (error) {
        expect(error).toBe('Redis error')
        expect(redisClient.get).toHaveBeenCalledWith(`ephemeral:${key}`)
      }
    })
  })

  describe('removeData', () => {
    it('should remove data', async () => {
      await dataStore.removeData(key)

      expect(redisClient.del).toHaveBeenCalledWith(`ephemeral:${key}`)
    })
  })
})
