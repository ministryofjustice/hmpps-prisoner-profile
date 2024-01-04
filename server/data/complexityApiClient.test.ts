import nock from 'nock'
import config from '../config'
import { complexityOfNeedHighMock } from './localMockData/complexityOfNeedMock'
import ComplexityApiRestClient from './complexityApiClient'

jest.mock('./tokenStore')

const token = { access_token: 'token-1', expires_in: 300 }

describe('complexityApiClient', () => {
  let complexityApi: nock.Scope
  let complexityApiClient: ComplexityApiRestClient

  beforeEach(() => {
    complexityApi = nock(config.apis.complexityApi.url)
    complexityApiClient = new ComplexityApiRestClient(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  const mockSuccessfulComplexityApiCall = <TReturnData>(url: string, returnData: TReturnData) => {
    complexityApi.get(url).matchHeader('authorization', `Bearer ${token.access_token}`).reply(200, returnData)
  }

  describe('getComplexityOfNeed', () => {
    it('Should return data from the API', async () => {
      const prisonerNumber = 'A1234BC'
      mockSuccessfulComplexityApiCall(`/complexity-of-need/offender-no/${prisonerNumber}`, complexityOfNeedHighMock)

      const output = await complexityApiClient.getComplexityOfNeed(prisonerNumber)
      expect(output).toEqual(complexityOfNeedHighMock)
    })
  })
})
