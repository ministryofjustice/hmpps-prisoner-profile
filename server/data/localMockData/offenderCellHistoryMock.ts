import { OffenderCellHistory } from '../../interfaces/prisonApi/offenderCellHistoryInterface'

const OffenderCellHistoryMock: OffenderCellHistory = {
  content: [
    {
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
      movementMadeBy: 'KQJ74F',
      offenderNo: 'A1234AA',
    },
  ],
}

export default OffenderCellHistoryMock
