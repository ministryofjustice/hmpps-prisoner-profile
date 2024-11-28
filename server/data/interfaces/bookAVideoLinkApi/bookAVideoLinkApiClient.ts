import CreateVideoBookingRequest, { VideoBookingSearchRequest, VideoLinkBooking } from './VideoLinkBooking'
import Court from './Court'
import ReferenceCode from './ReferenceCode'

export interface BookAVideoLinkApiClient {
  addVideoLinkBooking(videoLinkBooking: CreateVideoBookingRequest): Promise<number>
  amendVideoLinkBooking(videoBookingId: number, videoLinkBooking: CreateVideoBookingRequest): Promise<void>
  getVideoLinkBooking(searchRequest: VideoBookingSearchRequest): Promise<VideoLinkBooking>
  getCourts(): Promise<Court[]>
  getCourtHearingTypes(): Promise<ReferenceCode[]>
}
