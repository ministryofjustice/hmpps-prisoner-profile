import CreateVideoBookingRequest from './CreateVideoBookingRequest'
import Court from './Court'
import ReferenceCode from './ReferenceCode'

export interface BookAVideoLinkApiClient {
  addVideoLinkBooking(videoLinkBooking: CreateVideoBookingRequest): Promise<number>
  getCourts(): Promise<Court[]>
  getCourtHearingTypes(): Promise<ReferenceCode[]>
}
