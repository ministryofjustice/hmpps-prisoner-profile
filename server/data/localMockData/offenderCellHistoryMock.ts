import { OffenderCellHistory, OffenderCellHistoryItem } from '../../interfaces/prisonApi/offenderCellHistoryInterface'

export const mockCellHistoryItem1: OffenderCellHistoryItem = {
  bookingId: 1234134,
  livingUnitId: 111111,
  assignmentDate: '2024-01-01',
  assignmentDateTime: '2024-01-01T01:02:03',
  assignmentReason: 'ADM',
  agencyId: 'MDI',
  description: 'MDI-1-1-1',
  bedAssignmentHistorySequence: 4,
  movementMadeBy: 'DEMO_USER1',
  offenderNo: 'A1234AA',
}

export const mockCellHistoryItem2: OffenderCellHistoryItem = {
  bookingId: 1234134,
  livingUnitId: 222222,
  assignmentDate: '2023-12-01',
  assignmentDateTime: '2023-12-01T10:20:30',
  assignmentEndDate: '2024-01-01',
  assignmentEndDateTime: '2024-01-01T01:02:03',
  assignmentReason: 'ADM',
  agencyId: 'MDI',
  description: 'MDI-1-1-2',
  bedAssignmentHistorySequence: 3,
  movementMadeBy: 'DEMO_USER1',
  offenderNo: 'A1234AA',
}

export const mockCellHistoryItem3: OffenderCellHistoryItem = {
  bookingId: 1234134,
  livingUnitId: 333333,
  assignmentDate: '2023-12-01',
  assignmentDateTime: '2023-12-01T01:02:03',
  assignmentEndDate: '2023-12-01',
  assignmentEndDateTime: '2023-12-01T10:20:30',
  assignmentReason: 'ADM',
  agencyId: 'MDI',
  description: 'MDI-RECP',
  bedAssignmentHistorySequence: 2,
  movementMadeBy: 'DEMO_USER1',
  offenderNo: 'A1234AA',
}

export const mockCellHistoryItem4: OffenderCellHistoryItem = {
  bookingId: 1234134,
  livingUnitId: 444444,
  assignmentDate: '2023-11-01',
  assignmentDateTime: '2023-11-01T01:02:03',
  assignmentEndDate: '2023-12-01',
  assignmentEndDateTime: '2023-12-01T01:02:03',
  assignmentReason: 'ADM',
  agencyId: 'LEI',
  description: 'LEI-1-1-4',
  bedAssignmentHistorySequence: 1,
  movementMadeBy: 'DEMO_USER1',
  offenderNo: 'A1234AA',
}

export const OffenderCellHistoryMock: OffenderCellHistory = {
  content: [mockCellHistoryItem1, mockCellHistoryItem2, mockCellHistoryItem3, mockCellHistoryItem4],
}

export const mockOffenderCellHistory = (overrides: Partial<OffenderCellHistoryItem>[] = []): OffenderCellHistory => {
  return { content: overrides.map(override => ({ ...mockCellHistoryItem1, ...override })) }
}
