import ReferenceDataStore from './referenceDataStore'
import { RedisClient } from '../redisClient'
import { CountryReferenceDataCodesMock } from '../localMockData/personIntegrationReferenceDataMock'

const redisClient = {
  on: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  connect: jest.fn(),
}

describe('prisonRegisterStore', () => {
  let referenceDataStore: ReferenceDataStore

  beforeEach(() => {
    referenceDataStore = new ReferenceDataStore(redisClient as unknown as RedisClient)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should set reference data codes', async () => {
    // Given
    redisClient.set.mockResolvedValue(null)
    const durationHours = 1

    // When
    await referenceDataStore.setReferenceData('COUNTRY', CountryReferenceDataCodesMock, durationHours)

    // Then
    expect(redisClient.set).toHaveBeenCalledWith(
      'reference_data_COUNTRY',
      JSON.stringify(CountryReferenceDataCodesMock),
      { EX: 3600 }, // 1 hr in seconds
    )
  })

  it('should get reference data given redis client returns reference data', async () => {
    // Given
    const serializedData = JSON.stringify(CountryReferenceDataCodesMock)
    redisClient.get.mockResolvedValue(serializedData)

    // When
    const returnedData = await referenceDataStore.getReferenceData('COUNTRY')

    // Then
    expect(returnedData).toStrictEqual(CountryReferenceDataCodesMock)
    expect(redisClient.get).toHaveBeenCalledWith('reference_data_COUNTRY')
  })

  it('should get empty array given there is no data in redis', async () => {
    // Given
    const serializedData: string = null
    redisClient.get.mockResolvedValue(serializedData)

    // When
    const returnedData = await referenceDataStore.getReferenceData('COUNTRY')

    // Then
    expect(returnedData).toStrictEqual([])
    expect(redisClient.get).toHaveBeenCalledWith('reference_data_COUNTRY')
  })

  it('should not get data given redis client throws an error', async () => {
    // Given
    redisClient.get.mockRejectedValue('some error')

    // When
    try {
      await referenceDataStore.getReferenceData('COUNTRY')
    } catch (error) {
      // Then
      expect(error).toBe('some error')
      expect(redisClient.get).toHaveBeenCalledWith('reference_data_COUNTRY')
    }
  })
})
