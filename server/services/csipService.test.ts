import { CsipApiClient } from '../data/interfaces/csipApi/csipApiClient'
import CsipService from './csipService'
import { currentCsipDetailMock } from '../data/localMockData/csipApi/currentCsipDetailMock'

describe('csipService', () => {
  let csipApiClient: CsipApiClient

  beforeEach(() => {
    csipApiClient = {
      getCurrentCsip: jest.fn(),
    }
  })

  describe('getCurrentCsip', () => {
    it('should return current CSIP details', async () => {
      csipApiClient.getCurrentCsip = jest.fn(async () => currentCsipDetailMock)

      const service = new CsipService(() => csipApiClient)

      const response = await service.getCurrentCsip('token', 'A1234AA')

      expect(response).toEqual(currentCsipDetailMock)
    })
  })
})
