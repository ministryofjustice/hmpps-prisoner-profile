import nock from 'nock'
import config from '../config'
import CsipApiRestClient from './csipApiClient'
import { CsipApiClient } from './interfaces/csipApi/csipApiClient'
import { currentCsipDetailMock } from './localMockData/csipApi/currentCsipDetailMock'

const token = { access_token: 'token-1', expires_in: 300 }
describe('csipApiClient', () => {
  let fakeCsipApi: nock.Scope
  let csipApiClient: CsipApiClient

  beforeEach(() => {
    fakeCsipApi = nock(config.apis.csipApi.url)
    csipApiClient = new CsipApiRestClient(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  const mockSuccessfulApiCall = <TReturnData>(url: string, returnData: TReturnData) => {
    fakeCsipApi.get(url).matchHeader('authorization', `Bearer ${token.access_token}`).reply(200, returnData)
  }

  describe('getCurrentCsip', () => {
    it('Should return data from the API', async () => {
      const prisonerNumber = 'AB1234Y'
      mockSuccessfulApiCall(`/prisoners/${prisonerNumber}/csip-records/current`, currentCsipDetailMock)

      const output = await csipApiClient.getCurrentCsip(prisonerNumber)
      expect(output).toEqual(currentCsipDetailMock)
    })
  })
})
