import PrisonService from './prisonService'
import PrisonRegisterStore from '../data/prisonRegisterStore/prisonRegisterStore'
import PrisonRegisterApiRestClient from '../data/prisonRegisterApiClient'
import toPrison from './mappers/prisonMapper'
import { PrisonDto } from '../data/interfaces/prisonRegisterApi/prisonRegisterApiTypes'
import { prisonsKeyedByPrisonId } from '../data/localMockData/prisonRegisterMockData'
import { Prison } from './interfaces/prisonService/PrisonServicePrisons'

jest.mock('./mappers/prisonMapper')
jest.mock('../data/prisonRegisterStore/prisonRegisterStore')
jest.mock('../data/prisonRegisterApiClient')

describe('prisonService', () => {
  const mockedPrisonMapper = toPrison as jest.MockedFunction<typeof toPrison>

  const prisonRegisterStore = new PrisonRegisterStore(null) as jest.Mocked<PrisonRegisterStore>
  const prisonRegisterClient = new PrisonRegisterApiRestClient(null) as jest.Mocked<PrisonRegisterApiRestClient>
  const prisonRegisterClientBuilder = jest.fn()

  const prisonService = new PrisonService(prisonRegisterStore, prisonRegisterClientBuilder)

  beforeEach(() => {
    jest.resetAllMocks()
    prisonRegisterClientBuilder.mockReturnValue(prisonRegisterClient)
  })

  const allPrisons: Array<PrisonDto> = [
    prisonsKeyedByPrisonId['AKI'], // not an active prison
    prisonsKeyedByPrisonId['ASI'], // an active prison
    prisonsKeyedByPrisonId['MDI'], // an active prison
  ]

  const activePrisons: Array<PrisonDto> = [
    prisonsKeyedByPrisonId['ASI'], // an active prison
    prisonsKeyedByPrisonId['MDI'], // an active prison
  ]

  describe('getPrisonByPrisonId', () => {
    it('should get prison by ID given prison has been previously cached', async () => {
      // Given
      const prisonId = 'MDI'
      const systemToken = 'a-system-token'

      prisonRegisterStore.getActivePrisons.mockResolvedValue(activePrisons)

      const moorlandPrisonResponse = prisonsKeyedByPrisonId['MDI']

      const expectedPrison: Prison = {
        prisonId: 'MDI',
        prisonName: 'Moorland (HMP & YOI)',
      }
      mockedPrisonMapper.mockReturnValue(expectedPrison)

      // When
      const actual = await prisonService.getPrisonByPrisonId(prisonId, systemToken)

      // Then
      expect(actual).toEqual(expectedPrison)
      expect(prisonRegisterStore.getActivePrisons).toHaveBeenCalled()
      expect(mockedPrisonMapper).toHaveBeenCalledWith(moorlandPrisonResponse)
      expect(prisonRegisterClient.getAllPrisons).not.toHaveBeenCalled()
      expect(prisonRegisterStore.setActivePrisons).not.toHaveBeenCalled()
    })

    it('should get prison by ID given prison has not been previously cached', async () => {
      // Given
      const prisonId = 'MDI'
      const systemToken = 'a-system-token'

      prisonRegisterStore.getActivePrisons.mockResolvedValue([])
      prisonRegisterClient.getAllPrisons.mockResolvedValue(allPrisons)

      const moorlandPrisonResponse = prisonsKeyedByPrisonId['MDI']

      const expectedPrison: Prison = {
        prisonId: 'MDI',
        prisonName: 'Moorland (HMP & YOI)',
      }
      mockedPrisonMapper.mockReturnValue(expectedPrison)

      // When
      const actual = await prisonService.getPrisonByPrisonId(prisonId, systemToken)

      // Then
      expect(actual).toEqual(expectedPrison)
      expect(prisonRegisterStore.getActivePrisons).toHaveBeenCalled()
      expect(mockedPrisonMapper).toHaveBeenCalledWith(moorlandPrisonResponse)
      expect(prisonRegisterClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(prisonRegisterClient.getAllPrisons).toHaveBeenCalled()
      expect(prisonRegisterStore.setActivePrisons).toHaveBeenCalledWith(activePrisons, 1)
    })

    it('should not get prison by ID given prison does not exist in cache or API', async () => {
      // Given
      const prisonId = 'some-unknown-prison-id'
      const systemToken = 'a-system-token'

      prisonRegisterStore.getActivePrisons.mockResolvedValue(activePrisons)
      prisonRegisterClient.getAllPrisons.mockResolvedValue(allPrisons)

      const expectedPrison: Prison = {
        prisonId,
        prisonName: undefined,
      }

      // When
      const actual = await prisonService.getPrisonByPrisonId(prisonId, systemToken)

      // Then
      expect(actual).toEqual(expectedPrison)
      expect(prisonRegisterStore.getActivePrisons).toHaveBeenCalled()
      expect(mockedPrisonMapper).not.toHaveBeenCalled()
      expect(prisonRegisterClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(prisonRegisterClient.getAllPrisons).toHaveBeenCalled()
      expect(prisonRegisterStore.setActivePrisons).toHaveBeenCalledWith(activePrisons, 1)
    })

    it('should get prison by ID given retrieving from cache throws an error', async () => {
      // Given
      const prisonId = 'MDI'
      const systemToken = 'a-system-token'

      prisonRegisterStore.getActivePrisons.mockRejectedValue('some-error')
      prisonRegisterClient.getAllPrisons.mockResolvedValue(allPrisons)

      const moorlandPrisonResponse = prisonsKeyedByPrisonId['MDI']

      const expectedPrison: Prison = {
        prisonId: 'MDI',
        prisonName: 'Moorland (HMP & YOI)',
      }
      mockedPrisonMapper.mockReturnValue(expectedPrison)

      // When
      const actual = await prisonService.getPrisonByPrisonId(prisonId, systemToken)

      // Then
      expect(actual).toEqual(expectedPrison)
      expect(prisonRegisterStore.getActivePrisons).toHaveBeenCalled()
      expect(mockedPrisonMapper).toHaveBeenCalledWith(moorlandPrisonResponse)
      expect(prisonRegisterClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(prisonRegisterClient.getAllPrisons).toHaveBeenCalled()
      expect(prisonRegisterStore.setActivePrisons).toHaveBeenCalledWith(activePrisons, 1)
    })

    it('should not get prison by ID given retrieving from cache and API both throw errors', async () => {
      // Given
      const prisonId = 'MDI'
      const systemToken = 'a-system-token'

      prisonRegisterStore.getActivePrisons.mockRejectedValue('some-cache-error')
      prisonRegisterClient.getAllPrisons.mockRejectedValue('some-api-error')

      const expectedPrison: Prison = {
        prisonId,
        prisonName: undefined,
      }

      // When
      const actual = await prisonService.getPrisonByPrisonId(prisonId, systemToken)

      // Then
      expect(actual).toEqual(expectedPrison)
      expect(prisonRegisterStore.getActivePrisons).toHaveBeenCalled()
      expect(mockedPrisonMapper).not.toHaveBeenCalled()
      expect(prisonRegisterClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(prisonRegisterClient.getAllPrisons).toHaveBeenCalled()
      expect(prisonRegisterStore.setActivePrisons).not.toHaveBeenCalled()
    })

    it('should get prison by ID given prison has not been previously cached but putting in cache throws an error', async () => {
      // Given
      const prisonId = 'MDI'
      const systemToken = 'a-system-token'

      prisonRegisterStore.getActivePrisons.mockResolvedValue([])
      prisonRegisterClient.getAllPrisons.mockResolvedValue(allPrisons)
      prisonRegisterStore.setActivePrisons.mockRejectedValue('some-error')

      const expectedPrison: Prison = {
        prisonId: 'MDI',
        prisonName: 'Moorland (HMP & YOI)',
      }
      mockedPrisonMapper.mockReturnValue(expectedPrison)

      // When
      const actual = await prisonService.getPrisonByPrisonId(prisonId, systemToken)

      // Then
      expect(actual).toEqual(expectedPrison)
      expect(prisonRegisterStore.getActivePrisons).toHaveBeenCalled()
      expect(prisonRegisterClientBuilder).toHaveBeenCalledWith(systemToken)
      expect(prisonRegisterClient.getAllPrisons).toHaveBeenCalled()
      expect(prisonRegisterStore.setActivePrisons).toHaveBeenCalledWith(activePrisons, 1)
    })
  })
})
