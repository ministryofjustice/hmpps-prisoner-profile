import nock from 'nock'
import config from '../config'
import LocationsInsidePrisonApiClient from './locationsInsidePrisonApiClient'
import { locationsApiMock } from './localMockData/locationsMock'

const token = { access_token: 'token-1', expires_in: 300 }

describe('locationsInsidePrisonApiClient', () => {
  let fakeLocationsInsidePrisonApi: nock.Scope
  let locationsInsidePrisonApiClient: LocationsInsidePrisonApiClient

  beforeEach(() => {
    fakeLocationsInsidePrisonApi = nock(config.apis.locationsInsidePrisonApi.url)
    locationsInsidePrisonApiClient = new LocationsInsidePrisonApiClient(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  const mockSuccessfulApiCall = <TReturnData>(url: string, returnData: TReturnData) => {
    fakeLocationsInsidePrisonApi
      .get(url)
      .matchHeader('authorization', `Bearer ${token.access_token}`)
      .reply(200, returnData)
  }

  describe('getLocationsForAppointments', () => {
    it('Should return data from the API', async () => {
      const id = 'MDI'
      mockSuccessfulApiCall(
        `/locations/prison/${id}/non-residential-usage-type/APPOINTMENT?sortByLocalName=true&formatLocalName=true`,
        locationsApiMock,
      )
      const output = await locationsInsidePrisonApiClient.getLocationsForAppointments(id)
      expect(output).toEqual(locationsApiMock)
    })
  })

  describe('getLocation', () => {
    it('Should return data from the API', async () => {
      const id = 'MDI'
      mockSuccessfulApiCall(`/locations/${id}?formatLocalName=true`, locationsApiMock[0])
      const output = await locationsInsidePrisonApiClient.getLocation(id)
      expect(output).toEqual(locationsApiMock[0])
    })
  })

  describe('getLocationByKey', () => {
    it('Should return data from the API', async () => {
      const key = 'LOCATION_KEY'
      mockSuccessfulApiCall(`/locations/key/${key}`, locationsApiMock[0])
      const output = await locationsInsidePrisonApiClient.getLocationByKey('LOCATION_KEY')
      expect(output).toEqual(locationsApiMock[0])
    })
  })

  describe('getLocationAttributes', () => {
    it('Should return data from the API', async () => {
      const locationId = 'AB1234C'
      const locationAttributes = [{ code: 'SO', description: 'Single Occupancy' }]

      mockSuccessfulApiCall(`/locations/${locationId}/attributes`, locationAttributes)
      const output = await locationsInsidePrisonApiClient.getLocationAttributes(locationId)
      expect(output).toEqual(locationAttributes)
    })
  })
})
