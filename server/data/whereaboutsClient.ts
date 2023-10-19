import RestClient from './restClient'
import { UnacceptableAbsences } from '../interfaces/unacceptableAbsences'
import { PageableQuery } from '../interfaces/pageable'
import { WhereaboutsApiClient } from './interfaces/whereaboutsApiClient'
import { CellMoveReason } from '../interfaces/cellMoveReason'

export default class WhereaboutsRestApiClient implements WhereaboutsApiClient {
  constructor(private restClient: RestClient) {}

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
