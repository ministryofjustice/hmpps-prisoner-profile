import PrisonRegisterStore from './prisonRegisterStore'
import { RedisClient } from '../redisClient'
import { PrisonDto } from '../interfaces/prisonRegisterApi/prisonRegisterApiTypes'
import { prisonsKeyedByPrisonId } from '../localMockData/prisonRegisterMockData'

const redisClient = {
  on: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  connect: jest.fn(),
}

const activePrisons: Array<PrisonDto> = [
  prisonsKeyedByPrisonId.ASI, // an active prison
  prisonsKeyedByPrisonId.MDI, // an active prison
]

describe('prisonRegisterStore', () => {
  let prisonRegisterStore: PrisonRegisterStore

  beforeEach(() => {
    prisonRegisterStore = new PrisonRegisterStore(redisClient as unknown as RedisClient)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should set active prisons', async () => {
    // Given
    redisClient.set.mockResolvedValue(null)
    const durationDays = 2

    // When
    await prisonRegisterStore.setActivePrisons(activePrisons, durationDays)

    // Then
    expect(redisClient.set).toHaveBeenCalledWith(
      'activePrisons',
      JSON.stringify(activePrisons),
      { EX: 172800 }, // 2 days in seconds
    )
  })

  it('should get active prisons given redis client returns active prisons', async () => {
    // Given
    const serializedActivePrisons = JSON.stringify(activePrisons)
    redisClient.get.mockResolvedValue(serializedActivePrisons)

    // When
    const returnedActivePrisons = await prisonRegisterStore.getActivePrisons()

    // Then
    expect(returnedActivePrisons).toStrictEqual(activePrisons)
    expect(redisClient.get).toHaveBeenCalledWith('activePrisons')
  })

  it('should get empty array of active prisons given there are no active prisons in redis', async () => {
    // Given
    const serializedActivePrisons: string = null
    redisClient.get.mockResolvedValue(serializedActivePrisons)

    const expectedActivePrisons: Array<PrisonDto> = []

    // When
    const returnedActivePrisons = await prisonRegisterStore.getActivePrisons()

    // Then
    expect(returnedActivePrisons).toStrictEqual(expectedActivePrisons)
    expect(redisClient.get).toHaveBeenCalledWith('activePrisons')
  })

  it('should not get active prisons given redis client throws an error', async () => {
    // Given
    redisClient.get.mockRejectedValue('some error')

    // When
    try {
      await prisonRegisterStore.getActivePrisons()
    } catch (error) {
      // Then
      expect(error).toBe('some error')
      expect(redisClient.get).toHaveBeenCalledWith('activePrisons')
    }
  })
})
