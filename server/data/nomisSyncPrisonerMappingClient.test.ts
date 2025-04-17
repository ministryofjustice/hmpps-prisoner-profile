import nock from 'nock'
import config from '../config'
import NomisSyncPrisonerMappingClient from './nomisSyncPrisonerMappingClient'

const token = { access_token: 'token-1', expires_in: 300 }

describe('nomisSyncPrisonerMappingClient', () => {
  let fakeNomisSyncPrisonerMappingClient: nock.Scope
  let nomisSyncPrisonerMappingClient: NomisSyncPrisonerMappingClient

  beforeEach(() => {
    fakeNomisSyncPrisonerMappingClient = nock(config.apis.nomisSyncPrisonerMappingApi.url)
    nomisSyncPrisonerMappingClient = new NomisSyncPrisonerMappingClient(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  const mockSuccessfulApiCall = <TReturnData>(url: string, returnData: TReturnData) => {
    fakeNomisSyncPrisonerMappingClient
      .get(url)
      .matchHeader('authorization', `Bearer ${token.access_token}`)
      .reply(200, returnData)
  }

  const apiResponse = {
    nomisLocationId: 123456,
    dpsLocationId: 'abcdefg',
  }
  describe('getMappingUsingNomisLocationId', () => {
    it('Should return data from the API', async () => {
      const nomisLocationId = 123456
      mockSuccessfulApiCall(`/api/locations/nomis/${nomisLocationId}`, apiResponse)
      const output = await nomisSyncPrisonerMappingClient.getMappingUsingNomisLocationId(nomisLocationId)
      expect(output).toEqual(apiResponse)
    })
  })

  describe('getMappingUsingDpsLocationId', () => {
    it('Should return data from the API', async () => {
      const dpsLocationId = 'abcdefg'
      mockSuccessfulApiCall(`/api/locations/dps/${dpsLocationId}`, apiResponse)
      const output = await nomisSyncPrisonerMappingClient.getMappingUsingDpsLocationId(dpsLocationId)
      expect(output).toEqual(apiResponse)
    })
  })
})
