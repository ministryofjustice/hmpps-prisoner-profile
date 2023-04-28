import { PagedListQueryParams, PagedList } from '../../interfaces/prisonApi/pagedList'
import { CaseNoteReferenceCode } from '../../interfaces/caseNotesApi/CaseNoteReferenceCode'

export interface CaseNotesApiClient {
  getCaseNotes(offenderNumber: string, queryParams: PagedListQueryParams): Promise<PagedList>
  getCaseNoteTypes(): Promise<CaseNoteReferenceCode[]>
}
