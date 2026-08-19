/**
 * Why a prisoner was moved into a cell, from hmpps-change-someones-cell-api.
 *
 * Replaces the two hops this page made before: whereabouts-api for a case note id, then
 * offender-case-notes for its text. `commentText` is the "what happened" text. Several fields are
 * nullable because records migrated from whereabouts genuinely do not have them - `source` says
 * which kind of record this is.
 */
export interface CellMovementReason {
  bookingId: number
  bedAssignmentSequence: number
  source: 'CELL_MOVEMENTS' | 'MIGRATED_FROM_WHEREABOUTS'
  toLocationKey?: string
  toLocationId?: string
  fromLocationKey?: string
  fromLocationId?: string
  prisonerNumber?: string
  reasonCode?: string
  commentText?: string
  caseNoteUuid?: string
  caseNoteLegacyId?: number
  occurredAt?: string
  recordedBy?: string
  movementType?: 'CELL_MOVE' | 'CELL_SWAP'
}

export interface CellMovementsApiClient {
  getCellMovementReason(
    bookingId: number,
    bedAssignmentSequence: number,
    ignore404: boolean,
  ): Promise<CellMovementReason | null>
}
