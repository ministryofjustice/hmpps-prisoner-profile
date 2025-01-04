import ReferenceDataStore from '../data/referenceDataStore/referenceDataStore'
import PersonIntegrationApiRestClient from '../data/personIntegrationApiClient'
import ReferenceDataService from './referenceDataService'
import {
  ActiveCountryReferenceDataCodesMock,
  CountryReferenceDataCodesMock,
} from '../data/localMockData/personIntegrationReferenceDataMock'
import { ProxyReferenceDataDomain } from '../data/interfaces/personIntegrationApi/personIntegrationApiClient'

jest.mock('../data/referenceDataStore/referenceDataStore')
jest.mock('../data/personIntegrationApiClient')

describe('referenceDataService', () => {
  const domain = ProxyReferenceDataDomain.country
  const code = 'ENG'
  const systemToken = 'a-system-token'
  const referenceDataStore = new ReferenceDataStore(null) as jest.Mocked<ReferenceDataStore>
  const personIntegrationApiClient = new PersonIntegrationApiRestClient(
    null,
  ) as jest.Mocked<PersonIntegrationApiRestClient>
  const personIntegrationApiClientBuilder = jest.fn()

  const referenceDataService = new ReferenceDataService(referenceDataStore, personIntegrationApiClientBuilder)

  beforeEach(() => {
    jest.resetAllMocks()
    personIntegrationApiClientBuilder.mockReturnValue(personIntegrationApiClient)
  })

  describe('getReferenceData', () => {
    it('should get previously cached reference data', async () => {
      referenceDataStore.getReferenceData.mockResolvedValue(CountryReferenceDataCodesMock)

      const actual = await referenceDataService.getReferenceData(domain, code, systemToken)
      expect(actual.code).toEqual(code)
    })

    it('should call API when reference data codes have not been previously cached', async () => {
      referenceDataStore.getReferenceData.mockResolvedValue([])
      personIntegrationApiClient.getReferenceDataCodes.mockResolvedValue(CountryReferenceDataCodesMock)

      const actual = await referenceDataService.getReferenceData(domain, code, systemToken)
      expect(actual.code).toEqual(code)
    })

    it('should return inactive code', async () => {
      referenceDataStore.getReferenceData.mockResolvedValue(CountryReferenceDataCodesMock)

      const actual = await referenceDataService.getReferenceData(domain, 'ZZZ', systemToken)
      expect(actual.code).toEqual('ZZZ')
    })

    it('returns undefined when code is not found', async () => {
      referenceDataStore.getReferenceData.mockResolvedValue([])
      personIntegrationApiClient.getReferenceDataCodes.mockResolvedValue(CountryReferenceDataCodesMock)

      const actual = await referenceDataService.getReferenceData(domain, '???', systemToken)
      expect(actual).toBeUndefined()
    })

    it('refreshes the cache if code cannot be found in the cache', async () => {
      const [newReferenceData, ...outdatedReferenceData] = CountryReferenceDataCodesMock
      referenceDataStore.getReferenceData.mockResolvedValue(outdatedReferenceData)
      personIntegrationApiClient.getReferenceDataCodes.mockResolvedValue(CountryReferenceDataCodesMock)

      const actual = await referenceDataService.getReferenceData(domain, newReferenceData.code, systemToken)
      expect(actual.code).toEqual(newReferenceData.code)
    })

    it('propagate error when retrieving from cache throws', async () => {
      referenceDataStore.getReferenceData.mockRejectedValue('some-cache-error')

      expect(referenceDataService.getReferenceData(domain, code, systemToken)).rejects.toEqual('some-cache-error')
    })

    it('propagate error when retrieving from api throws', async () => {
      referenceDataStore.getReferenceData.mockResolvedValue([])
      personIntegrationApiClient.getReferenceDataCodes.mockRejectedValue('some-api-error')

      expect(referenceDataService.getReferenceData(domain, code, systemToken)).rejects.toEqual('some-api-error')
    })
  })

  describe('getActiveReferenceDataCodes', () => {
    it('should get previously cached reference data codes', async () => {
      referenceDataStore.getReferenceData.mockResolvedValue(CountryReferenceDataCodesMock)

      const actual = await referenceDataService.getActiveReferenceDataCodes(domain, systemToken)
      expect(actual).toEqual(ActiveCountryReferenceDataCodesMock)
    })

    it('should call API when reference data codes have not been previously cached', async () => {
      referenceDataStore.getReferenceData.mockResolvedValue([])
      personIntegrationApiClient.getReferenceDataCodes.mockResolvedValue(CountryReferenceDataCodesMock)

      const actual = await referenceDataService.getActiveReferenceDataCodes(domain, systemToken)
      expect(actual).toEqual(ActiveCountryReferenceDataCodesMock)
    })

    it('propagate error when retrieving from cache throws', async () => {
      referenceDataStore.getReferenceData.mockRejectedValue('some-cache-error')

      expect(referenceDataService.getActiveReferenceDataCodes(domain, systemToken)).rejects.toEqual('some-cache-error')
    })

    it('propagate error when retrieving from api throws', async () => {
      referenceDataStore.getReferenceData.mockResolvedValue([])
      personIntegrationApiClient.getReferenceDataCodes.mockRejectedValue('some-api-error')

      expect(referenceDataService.getActiveReferenceDataCodes(domain, systemToken)).rejects.toEqual('some-api-error')
    })
  })
})
