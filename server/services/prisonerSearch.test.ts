import PrisonerSearchService from './prisonerSearch'
import { Prisoner } from '../interfaces/prisoner'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'

jest.mock('../data/prisonerSearchClient')

const prisonerNumber = '123123'

describe('Prisoner search service', () => {
  let prisonerSearchService: PrisonerSearchService

  describe('getUser', () => {
    beforeEach(() => {
      prisonerSearchService = new PrisonerSearchService(null)
    })

    it('Retrieves prisoner', async () => {
      jest
        .spyOn<any, string>(prisonerSearchService['prisonerSearchClient'], 'getPrisonerDetails')
        .mockReturnValue(PrisonerMockDataA as Prisoner)
      const result = await prisonerSearchService.getPrisonerDetails(prisonerNumber)

      expect(result.croNumber).toEqual('400862/08W')
    })

    it('Propagates error', async () => {
      jest
        .spyOn<any, string>(prisonerSearchService['prisonerSearchClient'], 'getPrisonerDetails')
        .mockRejectedValue(new Error('some error'))

      await expect(prisonerSearchService.getPrisonerDetails(prisonerNumber)).rejects.toEqual(new Error('some error'))
    })
  })
})
