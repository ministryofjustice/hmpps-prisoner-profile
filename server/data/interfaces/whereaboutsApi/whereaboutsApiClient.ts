import { AppointmentDefaults, AppointmentDetails, SavedAppointment } from './Appointment'

export interface WhereaboutsApiClient {
  getAppointment(appointmentId: number): Promise<AppointmentDetails>
  createAppointments(appointments: AppointmentDefaults): Promise<SavedAppointment[]>
}
