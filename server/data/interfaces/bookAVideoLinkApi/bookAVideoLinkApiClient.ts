import CreateVideoBookingRequest from './CreateVideoBookingRequest'
import Location from './Location'
import Court from './Court'
import ReferenceCode from './ReferenceCode'

export interface BookAVideoLinkApiClient {
  addVideoLinkBooking(videoLinkBooking: CreateVideoBookingRequest): Promise<number>
  getVideoLocations(prisonCode: string): Promise<Location[]>
  getCourts(): Promise<Court[]>
  getCourtHearingTypes(): Promise<ReferenceCode[]>
}
