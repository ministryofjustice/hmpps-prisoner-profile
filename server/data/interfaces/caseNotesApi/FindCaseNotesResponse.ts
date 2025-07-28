import CaseNote from './CaseNote'

export default interface FindCaseNotesResponse {
  content: CaseNote[]
  metadata: {
    totalElements: number
    page: number
    size: number
  }
  hasCaseNotes: boolean
}
