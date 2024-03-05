import { PagedListItem } from './PagedList'

export default interface OffenderCellHistory extends PagedListItem {
  content: OffenderCellHistoryItem[]
}

export interface OffenderCellHistoryItem {
  bookingId: number
  livingUnitId: number
  assignmentDate: string
  assignmentDateTime: string
  assignmentReason: string
  assignmentEndDate?: string
  assignmentEndDateTime?: string
  agencyId: string
  description: string
  bedAssignmentHistorySequence: number
  movementMadeBy: string
  offenderNo: string
}
