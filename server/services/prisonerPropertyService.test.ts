import PrisonerPropertyService from './prisonerPropertyService'
import { PrisonerPropertyApiClient } from '../data/interfaces/prisonerPropertyApi/prisonerPropertyApiClient'
import { propertySummaryMock } from '../data/localMockData/prisonerPropertySummaryMock'

describe('prisonerPropertyService', () => {
  const token = 'token'
  let apiClient: PrisonerPropertyApiClient
  let service: PrisonerPropertyService

  beforeEach(() => {
    apiClient = {
      getPrisonerPropertySummary: jest.fn(async () => propertySummaryMock),
    }
    service = new PrisonerPropertyService(() => apiClient)
  })

  describe('getPropertySummary', () => {
    it('returns the summary from the api', async () => {
      expect(await service.getPropertySummary(token, 'MDI', 'G6123VU')).toEqual(propertySummaryMock)
    })
  })
})
