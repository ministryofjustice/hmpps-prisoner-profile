import { OffenderCellHistory, OffenderCellHistoryItem } from '../../interfaces/prisonApi/offenderCellHistoryInterface'

const OffenderCellHistoryItemMock: OffenderCellHistoryItem = {
  bookingId: 1234134,
  livingUnitId: 123123,
  assignmentDate: '2020-10-12',
  assignmentDateTime: '2021-07-05T10:35:17',
  assignmentReason: 'ADM',
  assignmentEndDate: '2020-11-12',
  assignmentEndDateTime: '2021-07-05T10:35:17',
  agencyId: 'MDI',
  description: 'MDI-1-1-2',
  bedAssignmentHistorySequence: 2,
  movementMadeBy: 'DEMO_USER1',
  offenderNo: 'A1234AA',
}

const OffenderCellHistoryMock: OffenderCellHistory = {
  content: [OffenderCellHistoryItemMock],
}

const OffenderCellHistoryReceptionMock: OffenderCellHistory = {
  content: [{ ...OffenderCellHistoryItemMock, description: 'MDI-RECP' }],
}

export { OffenderCellHistoryMock, OffenderCellHistoryItemMock, OffenderCellHistoryReceptionMock }
