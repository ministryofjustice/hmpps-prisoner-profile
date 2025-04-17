import { RedisClient } from '../redisClient'
import RedisFeatureToggleStore from './redisFeatureToggleStore'

const redisClient = {
  on: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  connect: jest.fn(),
}

const prisonId = 'MDI'
const featureToggle = 'alertsApiEnabled'
const durationHours = 1

describe('redisFeatureToggleStore', () => {
  let redisFeatureToggleStore: RedisFeatureToggleStore

  beforeEach(() => {
    redisFeatureToggleStore = new RedisFeatureToggleStore(redisClient as unknown as RedisClient)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should set feature toggle', async () => {
    redisClient.set.mockResolvedValue(null)

    await redisFeatureToggleStore.setToggle(prisonId, featureToggle, true, durationHours)

    expect(redisClient.set).toHaveBeenCalledWith(
      'featureToggle:MDI:alertsApiEnabled',
      JSON.stringify(true),
      { EX: 3600 }, // 1 hour in seconds
    )
  })

  it('should get feature toggle status', async () => {
    const status = JSON.stringify(true)
    redisClient.get.mockResolvedValue(status)

    const returnedStatus = await redisFeatureToggleStore.getToggle(prisonId, featureToggle)

    expect(returnedStatus).toStrictEqual(true)
    expect(redisClient.get).toHaveBeenCalledWith('featureToggle:MDI:alertsApiEnabled')
  })

  it('should get false given there is no matching feature toggle in redis', async () => {
    const status: string = null
    redisClient.get.mockResolvedValue(status)

    const returnedStatus = await redisFeatureToggleStore.getToggle(prisonId, featureToggle)

    expect(returnedStatus).toStrictEqual(false)
    expect(redisClient.get).toHaveBeenCalledWith('featureToggle:MDI:alertsApiEnabled')
  })

  it('should not get status given redis client throws an error', async () => {
    redisClient.get.mockRejectedValue('Redis error')

    try {
      await redisFeatureToggleStore.getToggle(prisonId, featureToggle)
    } catch (error) {
      expect(error).toBe('Redis error')
      expect(redisClient.get).toHaveBeenCalledWith('featureToggle:MDI:alertsApiEnabled')
    }
  })
})
