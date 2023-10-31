import nock from 'nock'
import config from '../config'
import { WhereaboutsApiClient } from './interfaces/whereaboutsApiClient'
import WhereaboutsRestApiClient from './whereaboutsClient'
import { courtLocationsMock } from './localMockData/courtLocationsMock'
import { appointmentMock } from './localMockData/appointmentMock'
import { videoLinkBookingMock } from './localMockData/videoLinkBookingMock'

jest.mock('./tokenStore')

const token = { access_token: 'token-1', expires_in: 300 }

describe('whereaboutsClient', () => {
  let fakeWhereaboutsApi: nock.Scope
  let whereaboutsApiClient: WhereaboutsApiClient

  beforeEach(() => {
    fakeWhereaboutsApi = nock(config.apis.whereaboutsApi.url)
    whereaboutsApiClient = new WhereaboutsRestApiClient(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  const mockSuccessfulWhereaboutsApiCall = <TReturnData>(url: string, returnData: TReturnData) => {
    fakeWhereaboutsApi.get(url).matchHeader('authorization', `Bearer ${token.access_token}`).reply(200, returnData)
  }
  const mockSuccessfulWhereaboutsPostApiCall = <TReturnData>(url: string, body: any, returnData: TReturnData) => {
    fakeWhereaboutsApi
      .post(url, body)
      .matchHeader('authorization', `Bearer ${token.access_token}`)
      .reply(200, returnData)
  }

  describe('getCourts', () => {
    it('Should return data from the API', async () => {
      mockSuccessfulWhereaboutsApiCall(`/court/courts`, courtLocationsMock)

      const output = await whereaboutsApiClient.getCourts()
      expect(output).toEqual(courtLocationsMock)
    })
  })

  describe('createAppointments', () => {
    it('Should return data from the API', async () => {
      mockSuccessfulWhereaboutsPostApiCall(`/appointment`, appointmentMock, appointmentMock)

      const output = await whereaboutsApiClient.createAppointments(appointmentMock)
      expect(output).toEqual(appointmentMock)
    })
  })

  describe('addVideoLinkBooking', () => {
    it('Should return data from the API', async () => {
      mockSuccessfulWhereaboutsPostApiCall(`/court/video-link-bookings`, videoLinkBookingMock, 12345)

      const output = await whereaboutsApiClient.addVideoLinkBooking(videoLinkBookingMock)
      expect(output).toEqual(12345)
    })
  })
})
