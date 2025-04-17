import nock from 'nock'
import config from '../config'
import PrisonerProfileDeliusApiRestClient from './prisonerProfileDeliusApiClient'
import { PrisonerProfileDeliusApiClient } from './interfaces/deliusApi/prisonerProfileDeliusApiClient'
import { communityManagerMock } from './localMockData/communityManagerMock'
import probationDocuments from './localMockData/deliusApi/probationDocuments'

const token = { access_token: 'token-1', expires_in: 300 }

describe('prisonerProfileDeliusApiClient', () => {
  let fakePrisonerProfileDeliusApi: nock.Scope
  let prisonerProfileDeliusApiClient: PrisonerProfileDeliusApiClient

  beforeEach(() => {
    fakePrisonerProfileDeliusApi = nock(config.apis.prisonerProfileDeliusApi.url)
    prisonerProfileDeliusApiClient = new PrisonerProfileDeliusApiRestClient(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  const mockSuccessfulApiCall = <TReturnData>(url: string, returnData: TReturnData) => {
    fakePrisonerProfileDeliusApi
      .get(url)
      .matchHeader('authorization', `Bearer ${token.access_token}`)
      .reply(200, returnData)
  }

  describe('getCommunityManager', () => {
    it('Should return data from the API', async () => {
      const prisonerNumber = 'AB1234Y'
      mockSuccessfulApiCall(`/probation-cases/${prisonerNumber}/community-manager`, communityManagerMock)

      const output = await prisonerProfileDeliusApiClient.getCommunityManager(prisonerNumber)
      expect(output).toEqual(communityManagerMock)
    })
  })

  describe('getProbationDocuments', () => {
    it('Should return data from the API', async () => {
      const prisonerNumber = 'AB1234Y'
      mockSuccessfulApiCall(`/probation-cases/${prisonerNumber}/documents`, probationDocuments)

      const output = await prisonerProfileDeliusApiClient.getProbationDocuments(prisonerNumber)
      expect(output).toEqual(probationDocuments)
    })
  })
})
