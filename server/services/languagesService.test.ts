import LanguagesService from './languagesService'
import {
  LanguagePreferencesRequest,
  PersonCommunicationNeedsApiClient,
  PersonCommunicationNeedsReferenceDataDomain,
} from '../data/interfaces/personCommunicationNeedsApi/personCommunicationNeedsApiClient'
import MetricsService from './metrics/metricsService'
import ReferenceDataService from './referenceData/referenceDataService'
import { PrisonUser } from '../interfaces/HmppsUser'
import { RestClientBuilder } from '../data'
import {
  CommunicationNeedsDtoMock,
  LanguageRefDataMock,
} from '../data/localMockData/personCommunicationNeedsApiRefDataMock'

describe('LanguagesService', () => {
  let clientToken: string
  let prisonerNumber: string
  let user: PrisonUser
  let personCommunicationNeedsApiClient: PersonCommunicationNeedsApiClient
  let referenceDataService: ReferenceDataService
  let metricsService: MetricsService
  let languagesService: LanguagesService

  beforeEach(() => {
    clientToken = 'CLIENT_TOKEN'
    prisonerNumber = 'A1234BC'
    user = { username: 'USER1', staffId: 123 } as PrisonUser

    personCommunicationNeedsApiClient = {
      getCommunicationNeeds: jest.fn().mockReturnValue(CommunicationNeedsDtoMock),
      updateLanguagePreferences: jest.fn(),
      updateSecondaryLanguage: jest.fn(),
      deleteSecondaryLanguage: jest.fn(),
    } as unknown as PersonCommunicationNeedsApiClient

    const personCommunicationNeedsApiClientBuilder: RestClientBuilder<PersonCommunicationNeedsApiClient> = jest
      .fn()
      .mockReturnValue(personCommunicationNeedsApiClient)

    referenceDataService = {
      getActiveReferenceDataCodes: jest.fn().mockReturnValue(LanguageRefDataMock),
      getReferenceData: jest.fn(),
    } as Partial<ReferenceDataService> as ReferenceDataService

    metricsService = {
      trackPersonCommunicationNeedsUpdate: jest.fn(),
      trackHealthAndMedicationUpdate: jest.fn(),
      trackPersonIntegrationUpdate: jest.fn(),
      trackPrisonPersonUpdate: jest.fn(),
    } as jest.Mocked<MetricsService>

    languagesService = new LanguagesService(
      personCommunicationNeedsApiClientBuilder,
      referenceDataService,
      metricsService,
    )
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getCommunicationNeeds', () => {
    it('should call the API client with the correct parameters', async () => {
      const result = await languagesService.getCommunicationNeeds(clientToken, prisonerNumber)

      expect(personCommunicationNeedsApiClient.getCommunicationNeeds).toHaveBeenCalledWith(prisonerNumber)
      expect(result).toEqual(CommunicationNeedsDtoMock)
    })
  })

  describe('getReferenceData', () => {
    it('should call the reference data service with the correct parameters', async () => {
      const domains = [PersonCommunicationNeedsReferenceDataDomain.language]
      const result = await languagesService.getReferenceData(clientToken, domains)

      expect(referenceDataService.getActiveReferenceDataCodes).toHaveBeenCalledWith(
        PersonCommunicationNeedsReferenceDataDomain.language,
        clientToken,
      )
      expect(result).toEqual({ language: LanguageRefDataMock })
    })
  })

  describe('updateMainLanguage', () => {
    const languagePreferencesRequest: LanguagePreferencesRequest = {
      preferredSpokenLanguageCode: 'ENG',
      preferredWrittenLanguageCode: 'ENG',
      interpreterRequired: false,
    }

    it('should call the API client with the correct parameters', async () => {
      await languagesService.updateMainLanguage(clientToken, user, prisonerNumber, languagePreferencesRequest)

      expect(personCommunicationNeedsApiClient.updateLanguagePreferences).toHaveBeenCalledWith(
        prisonerNumber,
        languagePreferencesRequest,
      )
    })

    it('should track the update in metrics', async () => {
      await languagesService.updateMainLanguage(clientToken, user, prisonerNumber, languagePreferencesRequest)

      expect(metricsService.trackPersonCommunicationNeedsUpdate).toHaveBeenCalledWith({
        fieldsUpdated: ['language-preferences'],
        prisonerNumber,
        user,
      })
    })
  })
})
