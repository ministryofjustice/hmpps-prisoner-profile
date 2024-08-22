import RestClient from './restClient'
import config from '../config'
import { BookAVideoLinkApiClient } from './interfaces/bookAVideoLinkApi/bookAVideoLinkApiClient'
import CreateVideoBookingRequest from './interfaces/bookAVideoLinkApi/CreateVideoBookingRequest'
import { mapToQueryString } from '../utils/utils'
import Location from './interfaces/bookAVideoLinkApi/Location'
import Court from './interfaces/bookAVideoLinkApi/Court'
import ReferenceCode from './interfaces/bookAVideoLinkApi/ReferenceCode'

export default class BookAVideoLinkRestApiClient implements BookAVideoLinkApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Book A Video Link API', config.apis.bookAVideoLinkApi, token)
  }

  async addVideoLinkBooking(videoLinkBooking: CreateVideoBookingRequest): Promise<number> {
    return this.restClient.post<number>({ path: '/video-link-booking', data: videoLinkBooking })
  }

  async getVideoLocations(prisonCode: string): Promise<Location[]> {
    return this.restClient.get({
      path: `/prisons/${prisonCode}/locations`,
      query: mapToQueryString({ videoLinkOnly: true }),
    })
  }

  async getCourts(): Promise<Court[]> {
    return this.restClient.get({
      path: `/courts`,
      query: mapToQueryString({ enabledOnly: false }),
    })
  }

  async getCourtHearingTypes(): Promise<ReferenceCode[]> {
    return this.restClient.get({ path: `/reference-codes/group/COURT_HEARING_TYPE` })
  }
}
