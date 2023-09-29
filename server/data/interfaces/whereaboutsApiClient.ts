import { CellMoveReason } from '../../interfaces/cellMoveReason'
import { PageableQuery } from '../../interfaces/pageable'
import { UnacceptableAbsences } from '../../interfaces/unacceptableAbsences'

export interface WhereaboutsApiClient {
  getUnacceptableAbsences(
    prisonerNumber: string,
    fromDate: string,
    toDate: string,
    page: PageableQuery,
  ): Promise<UnacceptableAbsences>
  getCellMoveReason(bookingId: number, bedAssignmentHistorySequence: number): Promise<CellMoveReason>
}
