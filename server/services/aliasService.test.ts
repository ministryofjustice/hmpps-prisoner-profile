import { RestClientBuilder } from '../data'
import { PersonIntegrationApiClient } from '../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import MetricsService from './metrics/metricsService'
import { PrisonUser } from '../interfaces/HmppsUser'
import {
  PseudonymRequestMock,
  PseudonymResponseMock,
} from '../data/localMockData/personIntegrationApiReferenceDataMock'
import AliasService, { Name } from './aliasService'
import { personIntegrationApiClientMock } from '../../tests/mocks/personIntegrationApiClientMock'

jest.mock('../data')
jest.mock('./referenceData/referenceDataService')
jest.mock('./metrics/metricsService')

describe('AliasService', () => {
  const clientToken = 'test-token'
  const prisonerNumber = 'A1234AA'
  const user = { username: 'testuser' } as PrisonUser

  let aliasService: AliasService
  let personIntegrationApiClient: PersonIntegrationApiClient
  let metricsService: MetricsService

  beforeEach(() => {
    personIntegrationApiClient = personIntegrationApiClientMock()
    personIntegrationApiClient.getPseudonyms = jest.fn(async () => [PseudonymResponseMock])
    personIntegrationApiClient.updatePseudonym = jest.fn(async () => PseudonymResponseMock)

    metricsService = {
      trackPersonIntegrationUpdate: jest.fn(),
    } as unknown as MetricsService

    const personIntegrationApiClientBuilder: RestClientBuilder<PersonIntegrationApiClient> = jest.fn(
      () => personIntegrationApiClient,
    )

    aliasService = new AliasService(personIntegrationApiClientBuilder, metricsService)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('updateWorkingName', () => {
    const newName: Name = {
      firstName: 'first',
      middleName1: 'middleone',
      middleName2: 'middletwo',
      lastName: 'last',
    }

    it('should update working name', async () => {
      const result = await aliasService.updateWorkingName(clientToken, user, prisonerNumber, newName)

      expect(personIntegrationApiClient.updatePseudonym).toHaveBeenCalledWith(PseudonymResponseMock.sourceSystemId, {
        ...PseudonymRequestMock,
        ...newName,
      })

      expect(metricsService.trackPersonIntegrationUpdate).toHaveBeenCalledWith({
        fieldsUpdated: ['firstName', 'middleName1', 'middleName2', 'lastName'],
        prisonerNumber,
        user,
      })

      expect(result).toEqual(PseudonymResponseMock)
    })

    it('should throw not found exception if no working name', async () => {
      personIntegrationApiClient.getPseudonyms = jest.fn(async () => [
        {
          ...PseudonymResponseMock,
          isWorkingName: false,
        },
      ])

      const attemptUpdate = async () => aliasService.updateWorkingName(clientToken, user, prisonerNumber, newName)

      await expect(attemptUpdate).rejects.toThrow('Existing working name not found')
    })
  })

  describe('updateDateOfBirth', () => {
    const dateOfBirth = '1999-02-01'
    it('should update date of birth', async () => {
      const result = await aliasService.updateDateOfBirth(clientToken, user, prisonerNumber, dateOfBirth)

      expect(personIntegrationApiClient.updatePseudonym).toHaveBeenCalledWith(PseudonymResponseMock.sourceSystemId, {
        ...PseudonymRequestMock,
        dateOfBirth,
      })

      expect(metricsService.trackPersonIntegrationUpdate).toHaveBeenCalledWith({
        fieldsUpdated: ['dateOfBirth'],
        prisonerNumber,
        user,
      })

      expect(result).toEqual(PseudonymResponseMock)
    })

    it('should throw not found exception if no working name', async () => {
      personIntegrationApiClient.getPseudonyms = jest.fn(async () => [
        {
          ...PseudonymResponseMock,
          isWorkingName: false,
        },
      ])

      const attemptUpdate = async () => aliasService.updateDateOfBirth(clientToken, user, prisonerNumber, dateOfBirth)

      await expect(attemptUpdate).rejects.toThrow('Existing working name not found')
    })
  })
})
