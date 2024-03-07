export default interface CaseNote {
  bookingId: number
  caseNoteType: string
  caseNoteSubType: string
  numCaseNotes: number
  latestCaseNote: string
}
export interface CaseNoteCount {
  count: number
}

export interface CaseNoteUsage {
  offenderNo: string
  caseNoteType: string
  caseNoteSubType: string
  numCaseNotes: number
  latestCaseNote: string
}
