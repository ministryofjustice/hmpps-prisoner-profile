import RestClient from './restClient'
import { WhereaboutsApiClient } from './interfaces/whereaboutsApiClient'
import { AppointmentDefaults } from '../interfaces/whereaboutsApi/appointment'
import { CourtLocation } from '../interfaces/whereaboutsApi/courtLocation'
import { VideoLinkBookingForm } from '../interfaces/whereaboutsApi/videoLinkBooking'
import config from '../config'

export default class WhereaboutsRestApiClient implements WhereaboutsApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Whereabouts API', config.apis.whereaboutsApi, token)
  }

  private async get<T>(args: object): Promise<T> {
    return this.restClient.get<T>(args)
  }

  private async post(args: object): Promise<unknown> {
    return this.restClient.post(args)
  }

  async getCourts(): Promise<CourtLocation[]> {
    return this.get<CourtLocation[]>({ path: '/court/courts' })
  }

  async createAppointments(appointments: AppointmentDefaults): Promise<AppointmentDefaults> {
    return (await this.post({ path: `/appointment`, data: appointments })) as AppointmentDefaults
  }

  async addVideoLinkBooking(videoLinkBooking: VideoLinkBookingForm): Promise<number> {
    return (await this.post({ path: '/court/video-link-bookings', data: videoLinkBooking })) as number
  }

  async getCellMoveReason(bookingId: number, bedAssignmentHistorySequence: number): Promise<any> {
    return this.get<any>({
      path: `/cell/cell-move-reason/booking/${bookingId}/bed-assignment-sequence/${bedAssignmentHistorySequence}`,
    })
  }
}
