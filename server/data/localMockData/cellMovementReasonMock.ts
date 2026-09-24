import { CellMovementReason } from '../interfaces/cellMovementsApi'

export const CellMovementReasonMock: CellMovementReason = {
  bookingId: 1234134,
  bedAssignmentSequence: 10,
  source: 'MIGRATED_FROM_WHEREABOUTS',
  prisonerNumber: 'A1234BC',
  reasonCode: 'ADM',
  commentText: 'Initial text for case note.',
  caseNoteUuid: '6bc0e6a9-7e0f-4a4a-9c62-0d0a0b1d1234',
  caseNoteLegacyId: 123456,
  occurredAt: '2023-08-01T09:55:00',
}

export default CellMovementReasonMock
