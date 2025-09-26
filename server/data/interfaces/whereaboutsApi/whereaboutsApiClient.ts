import CellMoveReason from './CellMoveReason'
import PageableQuery from './PageableQuery'
import UnacceptableAbsences from './UnacceptableAbsences'
import { AppointmentDefaults, AppointmentDetails } from './Appointment'

export interface WhereaboutsApiClient {
  getAppointment(appointmentId: number): Promise<AppointmentDetails>
  createAppointments(appointments: AppointmentDefaults): Promise<AppointmentDefaults>
  getUnacceptableAbsences(
    prisonerNumber: string,
    fromDate: string,
    toDate: string,
    page: PageableQuery,
  ): Promise<UnacceptableAbsences>
  getCellMoveReason(bookingId: number, bedAssignmentHistorySequence: number, ignore404?: false): Promise<CellMoveReason>
  getCellMoveReason(
    bookingId: number,
    bedAssignmentHistorySequence: number,
    ignore404: boolean,
  ): Promise<CellMoveReason | null>
}
