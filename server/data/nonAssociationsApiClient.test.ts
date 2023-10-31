import nock from 'nock'
import config from '../config'
import nonAssociationDetailsDummyData from './localMockData/nonAssociations'
import { NonAssociationsApiClient } from './interfaces/nonAssociationsApiClient'
import NonAssociationsApiRestClient from './nonAssociationsApiClient'

jest.mock('./tokenStore')

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
        `/legacy/api/offenders/${prisonerNumber}/non-association-details?currentPrisonOnly=true&excludeInactive=true`,
        nonAssociationDetailsDummyData,
      )

      const output = await nonAssociationsApiClient.getNonAssociationDetails(prisonerNumber)
      expect(output).toEqual(nonAssociationDetailsDummyData)
    })
  })
})
