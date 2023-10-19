import RestClient from './restClient'
import { UnacceptableAbsences } from '../interfaces/unacceptableAbsences'
import { PageableQuery } from '../interfaces/pageable'
import { WhereaboutsApiClient } from './interfaces/whereaboutsApiClient'
import { AppointmentDefaults } from '../interfaces/whereaboutsApi/appointment'
import { CourtLocation } from '../interfaces/whereaboutsApi/courtLocation'
import { VideoLinkBookingForm } from '../interfaces/whereaboutsApi/videoLinkBooking'
import config from '../config'
import { CellMoveReason } from '../interfaces/cellMoveReason'

export default class WhereaboutsRestApiClient implements WhereaboutsApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Whereabouts API', config.apis.whereaboutsApi, token)
  }

  async getCourts(): Promise<CourtLocation[]> {
    return this.restClient.get<CourtLocation[]>({ path: '/court/courts' })
  }

  async createAppointments(appointments: AppointmentDefaults): Promise<AppointmentDefaults> {
    return (await this.restClient.post({ path: `/appointment`, data: appointments })) as AppointmentDefaults
  }

  async addVideoLinkBooking(videoLinkBooking: VideoLinkBookingForm): Promise<number> {
    return (await this.restClient.post({ path: '/court/video-link-bookings', data: videoLinkBooking })) as number
  }

  async getUnacceptableAbsences(
    offenderNumber: string,
    fromDate: string,
    toDate: string,
    page: PageableQuery,
  ): Promise<UnacceptableAbsences> {
    return this.restClient.get<UnacceptableAbsences>({
      path: `/attendances/offender/${offenderNumber}/unacceptable-absences?fromDate=${fromDate}&toDate=${toDate}&page=${page}`,
    })
  }

  async getCellMoveReason(bookingId: number, bedAssignmentHistorySequence: number): Promise<CellMoveReason> {
    return this.restClient.get<CellMoveReason>({
      path: `/cell/cell-move-reason/booking/${bookingId}/bed-assignment-sequence/${bedAssignmentHistorySequence}`,
    })
  }
}
