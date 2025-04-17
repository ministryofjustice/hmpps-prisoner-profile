import RestClient from './restClient'
import config from '../config'
import { BookAVideoLinkApiClient } from './interfaces/bookAVideoLinkApi/bookAVideoLinkApiClient'
import CreateVideoBookingRequest, {
  AmendVideoBookingRequest,
  VideoBookingSearchRequest,
  VideoLinkBooking,
} from './interfaces/bookAVideoLinkApi/VideoLinkBooking'
import { mapToQueryString } from '../utils/utils'
import Court, { ProbationTeam } from './interfaces/bookAVideoLinkApi/Court'
import ReferenceCode from './interfaces/bookAVideoLinkApi/ReferenceCode'

export default class BookAVideoLinkRestApiClient implements BookAVideoLinkApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Book A Video Link API', config.apis.bookAVideoLinkApi, token)
  }

  async addVideoLinkBooking(videoLinkBooking: CreateVideoBookingRequest): Promise<number> {
    return this.restClient.post<number>({ path: '/video-link-booking', data: videoLinkBooking })
  }

  async amendVideoLinkBooking(videoBookingId: number, videoLinkBooking: AmendVideoBookingRequest): Promise<void> {
    return this.restClient.put<void>({ path: `/video-link-booking/id/${videoBookingId}`, data: videoLinkBooking })
  }

  async getVideoLinkBooking(searchRequest: VideoBookingSearchRequest): Promise<VideoLinkBooking> {
    return this.restClient.post<VideoLinkBooking>({ path: '/video-link-booking/search', data: searchRequest })
  }

  async getCourts(): Promise<Court[]> {
    return this.restClient.get({
      path: `/courts`,
      query: mapToQueryString({ enabledOnly: false }),
    })
  }

  async getProbationTeams(): Promise<ProbationTeam[]> {
    return this.restClient.get({
      path: `/probation-teams`,
      query: mapToQueryString({ enabledOnly: false }),
    })
  }

  async getCourtHearingTypes(): Promise<ReferenceCode[]> {
    return this.restClient.get({ path: `/reference-codes/group/COURT_HEARING_TYPE` })
  }

  async getProbationMeetingTypes(): Promise<ReferenceCode[]> {
    return this.restClient.get({ path: `/reference-codes/group/PROBATION_MEETING_TYPE` })
  }
}
