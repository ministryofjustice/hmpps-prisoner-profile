import PagedList, { CaseNotesListQueryParams } from '../prisonApi/PagedList'
import CaseNoteType from './CaseNoteType'
import CaseNote from './CaseNote'
import UpdateCaseNoteForm from './UpdateCaseNoteForm'

export default interface CaseNotesApiClient {
  getCaseNotes(offenderNumber: string, queryParams: CaseNotesListQueryParams): Promise<PagedList<CaseNote>>
  getCaseNoteTypes(): Promise<CaseNoteType[]>
  getCaseNoteTypesForUser(): Promise<CaseNoteType[]>
  addCaseNote(prisonerNumber: string, caseNote: CaseNote): Promise<CaseNote>
  updateCaseNote(prisonerNumber: string, caseNoteId: string, updateCaseNoteForm: UpdateCaseNoteForm): Promise<CaseNote>
  getCaseNote(prisonerNumber: string, caseNoteId: string, ignore404?: boolean): Promise<CaseNote>
}
