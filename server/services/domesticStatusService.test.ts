import { RestClientBuilder } from '../data'
import MetricsService from './metrics/metricsService'
import ReferenceDataService from './referenceData/referenceDataService'
import {
  PersonalRelationshipsApiClient,
  PersonalRelationshipsReferenceDataDomain,
} from '../data/interfaces/personalRelationshipsApi/personalRelationshipsApiClient'
import DomesticStatusService from './domesticStatusService'
import { PersonalRelationshipsDomesticStatusMock } from '../data/localMockData/personalRelationshipsApiMock'

jest.mock('./metrics/metricsService')
jest.mock('./referenceData/referenceDataService')

describe('DomesticStatusService', () => {
  let domesticStatusService: DomesticStatusService
  let personalRelationshipsApiClient: jest.Mocked<PersonalRelationshipsApiClient>
  let personalRelationshipsApiClientBuilder: jest.MockedFunction<RestClientBuilder<PersonalRelationshipsApiClient>>
  let referenceDataService: jest.Mocked<ReferenceDataService>
  let metricsService: jest.Mocked<MetricsService>

  const clientToken = 'CLIENT_TOKEN'
  const prisonerNumber = 'A1234BC'

  beforeEach(() => {
    personalRelationshipsApiClient = {
      getDomesticStatus: jest.fn(),
      updateDomesticStatus: jest.fn(),
    } as unknown as jest.Mocked<PersonalRelationshipsApiClient>

    personalRelationshipsApiClientBuilder = jest.fn().mockReturnValue(personalRelationshipsApiClient)

    referenceDataService = new ReferenceDataService(null, null) as jest.Mocked<ReferenceDataService>
    jest.spyOn(referenceDataService, 'getActiveReferenceDataCodes').mockResolvedValue([])

    metricsService = new MetricsService(null) as jest.Mocked<MetricsService>
    jest.spyOn(metricsService, 'trackPersonalRelationshipsUpdate').mockImplementation()

    domesticStatusService = new DomesticStatusService(
      personalRelationshipsApiClientBuilder,
      referenceDataService,
      metricsService,
    )
  })

  describe('getDomesticStatus', () => {
    it('should fetch and map domestic status value correctly', async () => {
      personalRelationshipsApiClient.getDomesticStatus.mockResolvedValue(PersonalRelationshipsDomesticStatusMock)

      const result = await domesticStatusService.getDomesticStatus(clientToken, prisonerNumber)

      expect(personalRelationshipsApiClientBuilder).toHaveBeenCalledWith(clientToken)
      expect(personalRelationshipsApiClient.getDomesticStatus).toHaveBeenCalledWith(prisonerNumber)

      expect(result).toEqual(
        expect.objectContaining({
          domesticStatusCode: 'S',
          domesticStatusDescription: 'Single – never married or in a civil partnership',
          active: true,
        }),
      )
    })

    it('Handles a null response from the API client', async () => {
      personalRelationshipsApiClient.getDomesticStatus.mockResolvedValue(null)

      const result = await domesticStatusService.getDomesticStatus(clientToken, prisonerNumber)

      expect(personalRelationshipsApiClientBuilder).toHaveBeenCalledWith(clientToken)
      expect(personalRelationshipsApiClient.getDomesticStatus).toHaveBeenCalledWith(prisonerNumber)

      expect(result).toBeNull()
    })
  })

  describe('getReferenceData', () => {
    it('should fetch reference data and return in mapped format sorted by description', async () => {
      const mockReferenceData = [
        { code: 'S', description: 'Single', id: '', listSequence: 0, isActive: true },
        { code: 'D', description: 'Divorced', id: '', listSequence: 0, isActive: true },
        { code: 'OTHER', description: 'OTHER', id: '', listSequence: 0, isActive: true },
      ]

      const expectedResult = [
        { code: 'D', description: 'Divorced or dissolved', id: '', listSequence: 0, isActive: true },
        { code: 'OTHER', description: 'OTHER', id: '', listSequence: 0, isActive: true },
        {
          code: 'S',
          description: 'Single – never married or in a civil partnership',
          id: '',
          listSequence: 0,
          isActive: true,
        },
      ]

      jest.spyOn(referenceDataService, 'getActiveReferenceDataCodes').mockResolvedValue(mockReferenceData)

      const result = await domesticStatusService.getReferenceData(clientToken)

      expect(referenceDataService.getActiveReferenceDataCodes).toHaveBeenCalledWith(
        PersonalRelationshipsReferenceDataDomain.DomesticStatus,
        clientToken,
      )

      expect(result).toEqual(expectedResult)
    })
  })

  describe('updateDomesticStatus', () => {
    const request = { domesticStatusCode: 'M' }

    it('should update domestic status value correctly', async () => {
      personalRelationshipsApiClient.updateDomesticStatus.mockResolvedValue(PersonalRelationshipsDomesticStatusMock)

      const result = await domesticStatusService.updateDomesticStatus(clientToken, prisonerNumber, request)

      expect(personalRelationshipsApiClientBuilder).toHaveBeenCalledWith(clientToken)
      expect(personalRelationshipsApiClient.updateDomesticStatus).toHaveBeenCalledWith(prisonerNumber, request)

      expect(result).toEqual(
        expect.objectContaining({
          domesticStatusCode: 'S',
          domesticStatusDescription: 'Single – never married or in a civil partnership',
          active: true,
        }),
      )
    })

    it('Handles a null response from the API client', async () => {
      personalRelationshipsApiClient.getDomesticStatus.mockResolvedValue(null)

      const result = await domesticStatusService.updateDomesticStatus(clientToken, prisonerNumber, request)

      expect(personalRelationshipsApiClientBuilder).toHaveBeenCalledWith(clientToken)
      expect(personalRelationshipsApiClient.updateDomesticStatus).toHaveBeenCalledWith(prisonerNumber, request)

      expect(result).toBeUndefined()
    })
  })
})
