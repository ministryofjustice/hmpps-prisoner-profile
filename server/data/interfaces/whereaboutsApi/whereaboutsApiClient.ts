import PageableQuery from './PageableQuery'
import UnacceptableAbsences from './UnacceptableAbsences'
import { AppointmentDefaults, AppointmentDetails, SavedAppointment } from './Appointment'

export interface WhereaboutsApiClient {
  getAppointment(appointmentId: number): Promise<AppointmentDetails>
  createAppointments(appointments: AppointmentDefaults): Promise<SavedAppointment[]>
  getUnacceptableAbsences(
    prisonerNumber: string,
    fromDate: string,
    toDate: string,
    page: PageableQuery,
  ): Promise<UnacceptableAbsences>
}
