import RestClient from './restClient'
import UnacceptableAbsences from './interfaces/whereaboutsApi/UnacceptableAbsences'
import PageableQuery from './interfaces/whereaboutsApi/PageableQuery'
import { WhereaboutsApiClient } from './interfaces/whereaboutsApi/whereaboutsApiClient'
import { AppointmentDefaults } from './interfaces/whereaboutsApi/Appointment'
import config from '../config'
import CellMoveReason from './interfaces/whereaboutsApi/CellMoveReason'

export default class WhereaboutsRestApiClient implements WhereaboutsApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Whereabouts API', config.apis.whereaboutsApi, token)
  }

  async createAppointments(appointments: AppointmentDefaults): Promise<AppointmentDefaults> {
    return this.restClient.post<AppointmentDefaults>({
      path: `/appointment`,
      data: appointments,
    })
  }

  getUnacceptableAbsences(
    offenderNumber: string,
    fromDate: string,
    toDate: string,
    page: PageableQuery,
  ): Promise<UnacceptableAbsences> {
    return this.restClient.get<UnacceptableAbsences>({
      path: `/attendances/offender/${offenderNumber}/unacceptable-absences?fromDate=${fromDate}&toDate=${toDate}&page=${page}`,
    })
  }

  getCellMoveReason(
    bookingId: number,
    bedAssignmentHistorySequence: number,
    ignore404 = false,
  ): Promise<CellMoveReason> {
    return this.restClient.get<CellMoveReason>({
      path: `/cell/cell-move-reason/booking/${bookingId}/bed-assignment-sequence/${bedAssignmentHistorySequence}`,
      ignore404,
    })
  }
}
