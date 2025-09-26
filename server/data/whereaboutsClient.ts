import RestClient from './restClient'
import UnacceptableAbsences from './interfaces/whereaboutsApi/UnacceptableAbsences'
import PageableQuery from './interfaces/whereaboutsApi/PageableQuery'
import { WhereaboutsApiClient } from './interfaces/whereaboutsApi/whereaboutsApiClient'
import { AppointmentDefaults, AppointmentDetails } from './interfaces/whereaboutsApi/Appointment'
import config from '../config'
import CellMoveReason from './interfaces/whereaboutsApi/CellMoveReason'

export default class WhereaboutsRestApiClient extends RestClient implements WhereaboutsApiClient {
  constructor(token: string) {
    super('Whereabouts API', config.apis.whereaboutsApi, token)
  }

  async getAppointment(appointmentId: number): Promise<AppointmentDetails> {
    return this.get({ path: `/appointment/${appointmentId}` }, this.token)
  }

  async createAppointments(appointments: AppointmentDefaults): Promise<AppointmentDefaults> {
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

  getCellMoveReason(bookingId: number, bedAssignmentHistorySequence: number, ignore404?: false): Promise<CellMoveReason>

  getCellMoveReason(
    bookingId: number,
    bedAssignmentHistorySequence: number,
    ignore404: boolean,
  ): Promise<CellMoveReason | null>

  getCellMoveReason(
    bookingId: number,
    bedAssignmentHistorySequence: number,
    ignore404 = false,
  ): Promise<CellMoveReason | null> {
    if (ignore404) {
      return this.getAndIgnore404({
        path: `/cell/cell-move-reason/booking/${bookingId}/bed-assignment-sequence/${bedAssignmentHistorySequence}`,
      })
    }
    return this.get(
      {
        path: `/cell/cell-move-reason/booking/${bookingId}/bed-assignment-sequence/${bedAssignmentHistorySequence}`,
      },
      this.token,
    )
  }
}
