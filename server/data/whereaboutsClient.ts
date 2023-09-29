import RestClient from './restClient'
import config from '../config'
import { UnacceptableAbsences } from '../interfaces/unacceptableAbsences'
import { PageableQuery } from '../interfaces/pageable'
import { WhereaboutsApiClient } from './interfaces/whereaboutsApiClient'
import { CellMoveReason } from '../interfaces/cellMoveReason'

export default class WhereaboutsRestApiClient implements WhereaboutsApiClient {
  constructor(private restClient: RestClient) {}

  private async get<T>(args: object, localMockData?: T): Promise<T> {
    try {
      return await this.restClient.get<T>(args)
    } catch (error) {
      if (config.localMockData === 'true' && localMockData) {
        return localMockData
      }
      return error
    }
  }

  async getUnacceptableAbsences(
    offenderNumber: string,
    fromDate: string,
    toDate: string,
    page: PageableQuery,
  ): Promise<UnacceptableAbsences> {
    return this.get<UnacceptableAbsences>({
      path: `/attendances/offender/${offenderNumber}/unacceptable-absences?fromDate=${fromDate}&toDate=${toDate}&page=${page}`,
    })
  }

  async getCellMoveReason(bookingId: number, bedAssignmentHistorySequence: number): Promise<CellMoveReason> {
    return this.get<CellMoveReason>({
      path: `/cell/cell-move-reason/booking/${bookingId}/bed-assignment-sequence/${bedAssignmentHistorySequence}`,
    })
  }
}
