import PagedList, { CaseNotesListQueryParams } from '../prisonApi/PagedList'
import CaseNoteType, { CaseNotesTypeParams } from './CaseNoteType'
import CaseNote from './CaseNote'
import UpdateCaseNoteForm from './UpdateCaseNoteForm'

export default interface CaseNotesApiClient {
  getCaseNotes(offenderNumber: string, queryParams: CaseNotesListQueryParams): Promise<PagedList<CaseNote>>
  getCaseNoteTypes(queryParams: CaseNotesTypeParams): Promise<CaseNoteType[]>
  addCaseNote(prisonerNumber: string, caseNote: CaseNote): Promise<CaseNote>
  updateCaseNote(prisonerNumber: string, caseNoteId: string, updateCaseNoteForm: UpdateCaseNoteForm): Promise<CaseNote>
  getCaseNote(prisonerNumber: string, caseNoteId: string, ignore404?: boolean): Promise<CaseNote>
}
