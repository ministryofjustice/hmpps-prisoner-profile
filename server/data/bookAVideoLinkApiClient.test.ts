import nock from 'nock'
import config from '../config'
import { BookAVideoLinkApiClient } from './interfaces/bookAVideoLinkApi/bookAVideoLinkApiClient'
import BookAVideoLinkRestApiClient from './bookAVideoLinkApiClient'
import CreateVideoBookingRequest from './interfaces/bookAVideoLinkApi/CreateVideoBookingRequest'

const token = { access_token: 'token-1', expires_in: 300 }

describe('bookAVideoLinkApiClient', () => {
  let fakeBookAVideoLinkApi: nock.Scope
  let bookAVideoLinkApiClient: BookAVideoLinkApiClient

  beforeEach(() => {
    fakeBookAVideoLinkApi = nock(config.apis.bookAVideoLinkApi.url)
    bookAVideoLinkApiClient = new BookAVideoLinkRestApiClient(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  const mockSuccessfulBookAVideoLinkApiCall = <TReturnData>(url: string, returnData: TReturnData) => {
    fakeBookAVideoLinkApi.get(url).matchHeader('authorization', `Bearer ${token.access_token}`).reply(200, returnData)
  }
  const mockSuccessfulBookAVideoLinkApiPost = <TReturnData>(url: string, body: any, returnData: TReturnData) => {
    fakeBookAVideoLinkApi
      .post(url, body)
      .matchHeader('authorization', `Bearer ${token.access_token}`)
      .reply(200, returnData)
  }

  describe('addVideoLinkBooking', () => {
    it('should post a video link booking', async () => {
      mockSuccessfulBookAVideoLinkApiPost('/video-link-booking', { bookingType: 'COURT' }, 1)

      const output = await bookAVideoLinkApiClient.addVideoLinkBooking({
        bookingType: 'COURT',
      } as CreateVideoBookingRequest)
      expect(output).toEqual(1)
    })
  })

  describe('getVideoLocations', () => {
    it('should return data from the API', async () => {
      mockSuccessfulBookAVideoLinkApiCall('/prisons/CODE/locations?videoLinkOnly=true', [{ description: 'VIDEO_LINK' }])

      const output = await bookAVideoLinkApiClient.getVideoLocations('CODE')
      expect(output).toEqual([{ description: 'VIDEO_LINK' }])
    })
  })

  describe('getCourts', () => {
    it('should return data from the API', async () => {
      mockSuccessfulBookAVideoLinkApiCall('/courts?enabledOnly=false', [{ description: 'COURT' }])

      const output = await bookAVideoLinkApiClient.getCourts()
      expect(output).toEqual([{ description: 'COURT' }])
    })
  })

  describe('getCourtHearingTypes', () => {
    it('should return data from the API', async () => {
      mockSuccessfulBookAVideoLinkApiCall('/reference-codes/group/COURT_HEARING_TYPE', [{ description: 'APPEAL' }])

      const output = await bookAVideoLinkApiClient.getCourtHearingTypes()
      expect(output).toEqual([{ description: 'APPEAL' }])
    })
  })
})