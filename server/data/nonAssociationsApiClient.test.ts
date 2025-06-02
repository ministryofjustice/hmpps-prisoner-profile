import nock from 'nock'
import config from '../config'
import { NonAssociationsApiClient } from './interfaces/nonAssociationsApi/nonAssociationsApiClient'
import NonAssociationsApiRestClient from './nonAssociationsApiClient'
import { prisonerNonAssociationsMock } from './localMockData/prisonerNonAssociationsMock'

const token = { access_token: 'token-1', expires_in: 300 }

describe('nonAssociationsApiClient', () => {
  let fakeNonAssociationsApi: nock.Scope
  let nonAssociationsApiClient: NonAssociationsApiClient

  beforeEach(() => {
    fakeNonAssociationsApi = nock(config.apis.nonAssociationsApi.url)
    nonAssociationsApiClient = new NonAssociationsApiRestClient(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  const mockSuccessfulPrisonApiCall = <TReturnData>(url: string, returnData: TReturnData) => {
    fakeNonAssociationsApi.get(url).matchHeader('authorization', `Bearer ${token.access_token}`).reply(200, returnData)
  }

  describe('getNonAssociations', () => {
    it.each(['ABC12', 'DEF456'])('Should return data from the API', async prisonerNumber => {
      mockSuccessfulPrisonApiCall(
        `/prisoner/${prisonerNumber}/non-associations?includeOtherPrisons=true`,
        prisonerNonAssociationsMock,
      )

      const output = await nonAssociationsApiClient.getPrisonerNonAssociations(prisonerNumber, {
        includeOtherPrisons: 'true',
      })
      expect(output).toEqual(prisonerNonAssociationsMock)
    })
  })

  describe('getNonAssociations', () => {
    it('Should open circuit breaker after failures, then close again after timeout', async () => {
      // Set test config
      config.apis.nonAssociationsApi.circuitBreaker.resetTimeout = 100

      // Assume the api is failing and make some requests
      fakeNonAssociationsApi.persist().get('/prisoner/XYZ999/non-associations/').reply(500)

      await Promise.all(
        Array.from({ length: 10 }).map(() =>
          nonAssociationsApiClient
            .getPrisonerNonAssociations('XYZ999', {
              includeOtherPrisons: 'true',
            })
            .catch(() => ''),
        ),
      )

      // Assume the api stopped failing
      mockSuccessfulPrisonApiCall(
        `/prisoner/XYZ999/non-associations?includeOtherPrisons=true`,
        prisonerNonAssociationsMock,
      )

      // Check the circuit opened and new requests are rejected
      await expect(
        nonAssociationsApiClient.getPrisonerNonAssociations('XYZ999', {
          includeOtherPrisons: 'true',
        }),
      ).rejects.toThrow('Breaker is open')

      // Wait for it to close
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })

      // Check it closed again
      const output = await nonAssociationsApiClient.getPrisonerNonAssociations('XYZ999', {
        includeOtherPrisons: 'true',
      })
      expect(output).toEqual(prisonerNonAssociationsMock)
    })
  })
})
