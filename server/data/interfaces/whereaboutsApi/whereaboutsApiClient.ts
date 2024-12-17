import CellMoveReason from './CellMoveReason'
import PageableQuery from './PageableQuery'
import UnacceptableAbsences from './UnacceptableAbsences'
import { AppointmentDefaults } from './Appointment'

export interface WhereaboutsApiClient {
  createAppointments(appointments: AppointmentDefaults): Promise<AppointmentDefaults>
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
