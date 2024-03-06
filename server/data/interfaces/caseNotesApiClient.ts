import { PagedList, CaseNotesListQueryParams } from '../../interfaces/prisonApi/pagedList'
import { CaseNoteType } from '../../interfaces/caseNoteType'
import { CaseNote, UpdateCaseNoteForm } from '../../interfaces/caseNotesApi/caseNote'

export interface CaseNotesApiClient {
  getCaseNotes(offenderNumber: string, queryParams: CaseNotesListQueryParams): Promise<PagedList<CaseNote>>
  getCaseNoteTypes(): Promise<CaseNoteType[]>
  getCaseNoteTypesForUser(): Promise<CaseNoteType[]>
  addCaseNote(prisonerNumber: string, caseNote: CaseNote): Promise<CaseNote>
  updateCaseNote(prisonerNumber: string, caseNoteId: string, updateCaseNoteForm: UpdateCaseNoteForm): Promise<CaseNote>
  getCaseNote(prisonerNumber: string, caseNoteId: string, ignore404?: boolean): Promise<CaseNote>
}
