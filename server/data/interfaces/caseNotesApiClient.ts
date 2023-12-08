import { PagedList, PagedListQueryParams } from '../../interfaces/prisonApi/pagedList'
import { CaseNoteType } from '../../interfaces/caseNoteType'
import { CaseNote } from '../../interfaces/caseNotesApi/caseNote'

export interface CaseNotesApiClient {
  getCaseNotes(offenderNumber: string, queryParams: PagedListQueryParams): Promise<PagedList<CaseNote>>
  getCaseNoteTypes(): Promise<CaseNoteType[]>
  getCaseNoteTypesForUser(): Promise<CaseNoteType[]>
  addCaseNote(prisonerNumber: string, caseNote: CaseNote): Promise<CaseNote>
  getCaseNote(prisonerNumber: string, caseNoteId: string, ignore404?: boolean): Promise<CaseNote>
}
