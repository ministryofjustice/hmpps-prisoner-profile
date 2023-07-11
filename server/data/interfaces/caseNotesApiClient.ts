import { PagedList, PagedListQueryParams } from '../../interfaces/prisonApi/pagedList'
import { CaseNoteType } from '../../interfaces/caseNoteType'
import { CaseNote } from '../../interfaces/caseNotesApi/caseNote'

export interface CaseNotesApiClient {
  getCaseNotes(offenderNumber: string, queryParams: PagedListQueryParams): Promise<PagedList>
  getCaseNoteTypes(): Promise<CaseNoteType[]>
  getCaseNoteTypesForUser(): Promise<CaseNoteType[]>
  addCaseNote(prisonerNumber: string, caseNote: CaseNote): Promise<CaseNote>
}
