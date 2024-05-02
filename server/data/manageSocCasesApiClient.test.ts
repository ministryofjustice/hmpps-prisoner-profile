import nock from 'nock'
import config from '../config'
import { ManageSocCasesApiClient } from './interfaces/manageSocCasesApi/manageSocCasesApiClient'
import ManageSocCasesApiRestClient from './manageSocCasesApiClient'

jest.mock('./tokenStore')

const token = { access_token: 'token-1', expires_in: 300 }

describe('manageSocCasesApiClient', () => {
  let fakeManageSocCasesApi: nock.Scope
  let manageSocCasesApiClient: ManageSocCasesApiClient

  beforeEach(() => {
    fakeManageSocCasesApi = nock(config.apis.manageSocCasesApi.url)
    manageSocCasesApiClient = new ManageSocCasesApiRestClient(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  const mockSuccessfulApiCall = <TReturnData>(url: string, returnData: TReturnData) => {
    fakeManageSocCasesApi.get(url).matchHeader('authorization', `Bearer ${token.access_token}`).reply(200, returnData)
  }

  describe('getNominal', () => {
    it('Should return data from the API', async () => {
      const prisonerNumber = 'AB1234Y'
      mockSuccessfulApiCall(`/soc/nominal/nomsId/${prisonerNumber}`, { id: 1 })

      const output = await manageSocCasesApiClient.getNominal(prisonerNumber)
      expect(output).toEqual({ id: 1 })
    })
  })
})
