import nock from 'nock'
import config from '../config'
import {
  mockOsPlacesAddressQueryResponse,
  mockOsPlacesInvalidApiKey,
} from './localMockData/osPlacesAddressQueryResponse'
import OsPlacesApiRestClient from './osPlacesApiRestClient'

describe('osPlacesApiRestClient', () => {
  let fakeOsPlaceApi: nock.Scope
  let osPlacesApiRestClient: OsPlacesApiRestClient
  const testQuery = '1,A123BC'

  beforeEach(() => {
    fakeOsPlaceApi = nock(config.apis.osPlacesApi.url)
    osPlacesApiRestClient = new OsPlacesApiRestClient()
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('getAddressesByFreeTextQuery', () => {
    it('should return data from api', async () => {
      fakeOsPlaceApi
        .get(`/find?query=${testQuery}&lr=EN&key=${config.apis.osPlacesApi.apiKey}`)
        .reply(200, mockOsPlacesAddressQueryResponse)

      const output = await osPlacesApiRestClient.getAddressesByFreeTextQuery(testQuery)
      expect(output).toEqual(mockOsPlacesAddressQueryResponse)
    })

    it('should handle error responses', async () => {
      fakeOsPlaceApi
        .get(`/find?query=${testQuery}&lr=EN&key=${config.apis.osPlacesApi.apiKey}`)
        .reply(401, mockOsPlacesInvalidApiKey)

      await expect(osPlacesApiRestClient.getAddressesByFreeTextQuery(testQuery)).rejects.toMatchObject({
        message: 'Error calling OS Places API: Unauthorized',
        status: 401,
      })
    })
  })
})
