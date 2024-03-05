import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import { beliefHistoryMock } from '../data/localMockData/beliefHistoryMock'
import BeliefService from './beliefService'

describe('beliefService', () => {
  let prisonApiClient: PrisonApiClient

  beforeEach(() => {
    prisonApiClient = prisonApiClientMock()
  })

  describe('getBeliefHistory', () => {
    it('should return a list of offender beliefs', async () => {
      prisonApiClient.getBeliefHistory = jest.fn(async () => beliefHistoryMock)

      const service = new BeliefService(() => prisonApiClient)

      const response = await service.getBeliefHistory('token', 'A1234AA', 123456)

      expect(response).toEqual(beliefHistoryMock)
    })
  })
})
