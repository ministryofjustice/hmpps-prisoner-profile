import CircuitBreaker from 'opossum'
import RestClient, { Request } from './restClient'
import UnacceptableAbsences from './interfaces/whereaboutsApi/UnacceptableAbsences'
import PageableQuery from './interfaces/whereaboutsApi/PageableQuery'
import { WhereaboutsApiClient } from './interfaces/whereaboutsApi/whereaboutsApiClient'
import { AppointmentDefaults, AppointmentDetails, SavedAppointment } from './interfaces/whereaboutsApi/Appointment'
import config from '../config'

export default class WhereaboutsRestApiClient extends RestClient implements WhereaboutsApiClient {
  constructor(token: string, circuitBreaker?: CircuitBreaker<[Request<unknown, unknown>, string], unknown>) {
    super('Whereabouts API', config.apis.whereaboutsApi, token, circuitBreaker)
  }

  async getAppointment(appointmentId: number): Promise<AppointmentDetails> {
    return this.get({ path: `/appointment/${appointmentId}` }, this.token)
  }

  async createAppointments(appointments: AppointmentDefaults): Promise<SavedAppointment[]> {
    return this.post(
      {
        path: '/appointment',
        data: appointments,
      },
      this.token,
    )
  }

  getUnacceptableAbsences(
    offenderNumber: string,
    fromDate: string,
    toDate: string,
    page: PageableQuery,
  ): Promise<UnacceptableAbsences> {
    return this.get(
      {
        path: `/attendances/offender/${offenderNumber}/unacceptable-absences?fromDate=${fromDate}&toDate=${toDate}&page=${page}`,
      },
      this.token,
    )
  }
}
