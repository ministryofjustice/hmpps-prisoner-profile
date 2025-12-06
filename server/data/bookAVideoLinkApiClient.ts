import CircuitBreaker from 'opossum'
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
import RestClient, { Request } from './restClient'

export default class BookAVideoLinkRestApiClient extends RestClient implements BookAVideoLinkApiClient {
  constructor(token: string, circuitBreaker?: CircuitBreaker<[Request<unknown, unknown>, string], unknown>) {
    super('Book A Video Link API', config.apis.bookAVideoLinkApi, token, circuitBreaker)
  }

  async addVideoLinkBooking(videoLinkBooking: CreateVideoBookingRequest): Promise<number> {
    return this.post({ path: '/video-link-booking', data: videoLinkBooking }, this.token)
  }

  async amendVideoLinkBooking(videoBookingId: number, videoLinkBooking: AmendVideoBookingRequest): Promise<number> {
    return this.put(
      {
        path: `/video-link-booking/id/${videoBookingId}`,
        data: videoLinkBooking,
      },
      this.token,
    )
  }

  async getVideoLinkBooking(searchRequest: VideoBookingSearchRequest): Promise<VideoLinkBooking> {
    return this.post(
      {
        path: '/video-link-booking/search',
        data: searchRequest,
      },
      this.token,
    )
  }

  async getCourts(): Promise<Court[]> {
    return this.get(
      {
        path: '/courts',
        query: mapToQueryString({ enabledOnly: false }),
      },
      this.token,
    )
  }

  async getProbationTeams(): Promise<ProbationTeam[]> {
    return this.get(
      {
        path: '/probation-teams',
        query: mapToQueryString({ enabledOnly: false }),
      },
      this.token,
    )
  }

  async getCourtHearingTypes(): Promise<ReferenceCode[]> {
    return this.get({ path: '/reference-codes/group/COURT_HEARING_TYPE' }, this.token)
  }

  async getProbationMeetingTypes(): Promise<ReferenceCode[]> {
    return this.get({ path: '/reference-codes/group/PROBATION_MEETING_TYPE' }, this.token)
  }
}
