import CreateVideoBookingRequest, { VideoBookingSearchRequest, VideoLinkBooking } from './VideoLinkBooking'
import Court, { ProbationTeam } from './Court'
import ReferenceCode from './ReferenceCode'

export interface BookAVideoLinkApiClient {
  addVideoLinkBooking(videoLinkBooking: CreateVideoBookingRequest): Promise<number>
  amendVideoLinkBooking(videoBookingId: number, videoLinkBooking: CreateVideoBookingRequest): Promise<number>
  getVideoLinkBooking(searchRequest: VideoBookingSearchRequest): Promise<VideoLinkBooking>
  getCourts(): Promise<Court[]>
  getProbationTeams(): Promise<ProbationTeam[]>
  getCourtHearingTypes(): Promise<ReferenceCode[]>
  getProbationMeetingTypes(): Promise<ReferenceCode[]>
}
