import { AppointmentDefaults } from '../../interfaces/whereaboutsApi/appointment'
import { CourtLocation } from '../../interfaces/whereaboutsApi/courtLocation'
import { VideoLinkBookingForm } from '../../interfaces/whereaboutsApi/videoLinkBooking'

export interface WhereaboutsApiClient {
  createAppointments(appointments: AppointmentDefaults): Promise<AppointmentDefaults>
  addVideoLinkBooking(videoLinkBooking: VideoLinkBookingForm): Promise<number>
  getCourts(): Promise<CourtLocation[]>
}
