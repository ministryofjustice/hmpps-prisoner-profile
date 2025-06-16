import { RestClientBuilder } from '../data'
import { PersonIntegrationApiClient } from '../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import MetricsService from './metrics/metricsService'
import { PrisonUser } from '../interfaces/HmppsUser'
import { AddIdentityNumbersRequestMock } from '../data/localMockData/personIntegrationApiReferenceDataMock'
import { personIntegrationApiClientMock } from '../../tests/mocks/personIntegrationApiClientMock'
import IdentityNumbersService from './identityNumbersService'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import { GetIdentifiersMock } from '../data/localMockData/getIdentifiersMock'

jest.mock('../data')
jest.mock('./metrics/metricsService')

describe('IdentityNumbersService', () => {
  let identityNumbersService: IdentityNumbersService
  let prisonApiClient: PrisonApiClient
  let personIntegrationApiClient: PersonIntegrationApiClient
  let metricsService: MetricsService
  let clientToken: string
  let prisonerNumber: string
  let user: PrisonUser

  beforeEach(() => {
    prisonApiClient = prisonApiClientMock()
    personIntegrationApiClient = personIntegrationApiClientMock()

    prisonApiClient.getIdentifiers = jest.fn(async () => GetIdentifiersMock)

    metricsService = {
      trackPersonIntegrationUpdate: jest.fn(),
    } as unknown as MetricsService

    const prisonApiClientBuilder: RestClientBuilder<PrisonApiClient> = jest.fn(() => prisonApiClient)
    const personIntegrationApiClientBuilder: RestClientBuilder<PersonIntegrationApiClient> = jest.fn(
      () => personIntegrationApiClient,
    )

    identityNumbersService = new IdentityNumbersService(
      prisonApiClientBuilder,
      personIntegrationApiClientBuilder,
      metricsService,
    )

    clientToken = 'test-token'
    prisonerNumber = 'A1234AA'
    user = { username: 'testuser' } as PrisonUser
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getIdentityNumbers', () => {
    it('should return identity numbers', async () => {
      const result = await identityNumbersService.getIdentityNumbers(clientToken, prisonerNumber)

      expect(prisonApiClient.getIdentifiers).toHaveBeenCalledWith(prisonerNumber, true)
      expect(result).toEqual(GetIdentifiersMock)
    })
  })

  describe('addIdentityNumbers', () => {
    it('should add identity numbers', async () => {
      await identityNumbersService.addIdentityNumbers(clientToken, user, prisonerNumber, AddIdentityNumbersRequestMock)

      expect(personIntegrationApiClient.addIdentityNumbers).toHaveBeenCalledWith(
        prisonerNumber,
        AddIdentityNumbersRequestMock,
      )
      expect(metricsService.trackPersonIntegrationUpdate).toHaveBeenCalledWith({
        fieldsUpdated: ['identity-numbers'],
        prisonerNumber,
        user,
      })
    })

    it('transform values to uppercase', async () => {
      const request = [
        {
          ...AddIdentityNumbersRequestMock[0],
          value: AddIdentityNumbersRequestMock[0].value.toLowerCase(),
        },
      ]
      await identityNumbersService.addIdentityNumbers(clientToken, user, prisonerNumber, request)

      expect(personIntegrationApiClient.addIdentityNumbers).toHaveBeenCalledWith(
        prisonerNumber,
        AddIdentityNumbersRequestMock,
      )
      expect(metricsService.trackPersonIntegrationUpdate).toHaveBeenCalledWith({
        fieldsUpdated: ['identity-numbers'],
        prisonerNumber,
        user,
      })
    })
  })
})
