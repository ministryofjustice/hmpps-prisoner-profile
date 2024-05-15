import nock from 'nock'
import config from '../config'
import PathfinderApiRestClient from './pathfinderApiClient'
import { PathfinderApiClient } from './interfaces/pathfinderApi/pathfinderApiClient'

const token = { access_token: 'token-1', expires_in: 300 }

describe('pathfinderApiClient', () => {
  let fakePathfinderApi: nock.Scope
  let pathfinderApiClient: PathfinderApiClient

  beforeEach(() => {
    fakePathfinderApi = nock(config.apis.caseNotesApi.url)
    pathfinderApiClient = new PathfinderApiRestClient(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  const mockSuccessfulApiCall = <TReturnData>(url: string, returnData: TReturnData) => {
    fakePathfinderApi.get(url).matchHeader('authorization', `Bearer ${token.access_token}`).reply(200, returnData)
  }

  describe('getCaseNotes', () => {
    it('Should return data from the API', async () => {
      const prisonerNumber = 'AB1234Y'
      mockSuccessfulApiCall(`/pathfinder/nominal/noms-id/${prisonerNumber}`, { id: 1 })

      const output = await pathfinderApiClient.getNominal(prisonerNumber)
      expect(output).toEqual({ id: 1 })
    })
  })
})
