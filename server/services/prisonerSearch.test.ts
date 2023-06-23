import PrisonerSearchService from './prisonerSearch'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { PrisonerSearchClient } from '../data/interfaces/prisonerSearchClient'

jest.mock('../data/prisonerSearchClient')

const prisonerNumber = '123123'

describe('Prisoner search service', () => {
  let prisonerSearchService: PrisonerSearchService
  let prisonerSearchClientSpy: PrisonerSearchClient

  describe('getUser', () => {
    it('Retrieves prisoner', async () => {
      prisonerSearchClientSpy = { getPrisonerDetails: jest.fn(async () => PrisonerMockDataA) }
      prisonerSearchService = new PrisonerSearchService(() => prisonerSearchClientSpy)
      const result = await prisonerSearchService.getPrisonerDetails('', prisonerNumber)
      expect(result.croNumber).toEqual('400862/08W')
    })

    it('Propagates error', async () => {
      prisonerSearchClientSpy = { getPrisonerDetails: jest.fn().mockRejectedValue(new Error('some error')) }
      prisonerSearchService = new PrisonerSearchService(() => prisonerSearchClientSpy)
      await expect(prisonerSearchService.getPrisonerDetails('', prisonerNumber)).rejects.toEqual(
        new Error('some error'),
      )
    })
  })
})
