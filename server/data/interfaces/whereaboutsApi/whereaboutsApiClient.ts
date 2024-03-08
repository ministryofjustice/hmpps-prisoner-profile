import CellMoveReason from './CellMoveReason'
import PageableQuery from './PageableQuery'
import UnacceptableAbsences from './UnacceptableAbsences'
import { AppointmentDefaults } from './Appointment'
import CourtLocation from './CourtLocation'
import VideoLinkBookingForm from './VideoLinkBookingForm'

export interface WhereaboutsApiClient {
  createAppointments(appointments: AppointmentDefaults): Promise<AppointmentDefaults>
  addVideoLinkBooking(videoLinkBooking: VideoLinkBookingForm): Promise<number>
  getCourts(): Promise<CourtLocation[]>
  getUnacceptableAbsences(
    prisonerNumber: string,
    fromDate: string,
    toDate: string,
    page: PageableQuery,
  ): Promise<UnacceptableAbsences>
  getCellMoveReason(
    bookingId: number,
    bedAssignmentHistorySequence: number,
    ignore404?: boolean,
  ): Promise<CellMoveReason>
}
