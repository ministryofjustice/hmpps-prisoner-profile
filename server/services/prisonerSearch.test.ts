import PrisonerSearchClient from '../data/prisonerSearchClient'
import PrisonerSearchService from './prisonerSearch'
import { Prisoner } from '../interfaces/prisoner'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'

jest.mock('../data/prisonerSearchClient')

const token = 'some token'
const prisonerNumber = '123123'

describe('Prisoner search service', () => {
  let prisonerSearchClient: jest.Mocked<PrisonerSearchClient>
  let prisonSearchService: PrisonerSearchService

  describe('getUser', () => {
    beforeEach(() => {
      prisonerSearchClient = new PrisonerSearchClient(null) as jest.Mocked<PrisonerSearchClient>
      prisonSearchService = new PrisonerSearchService(prisonerSearchClient)
    })
    it('Retrieves prisoner', async () => {
      prisonerSearchClient.getPrisonerDetails.mockResolvedValue(PrisonerMockDataA as Prisoner)

      const result = await prisonSearchService.getPrisonerDetails(token, prisonerNumber)

      expect(result.croNumber).toEqual('29906/12J')
    })
    it('Propagates error', async () => {
      prisonerSearchClient.getPrisonerDetails.mockRejectedValue(new Error('some error'))

      await expect(prisonSearchService.getPrisonerDetails(token, prisonerNumber)).rejects.toEqual(
        new Error('some error'),
      )
    })
  })
})
