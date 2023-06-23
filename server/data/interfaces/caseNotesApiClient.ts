import { PagedListQueryParams, PagedList } from '../../interfaces/prisonApi/pagedList'
import { CaseNoteType } from '../../interfaces/caseNoteType'

export interface CaseNotesApiClient {
  getCaseNotes(offenderNumber: string, queryParams: PagedListQueryParams): Promise<PagedList>
  getCaseNoteTypes(): Promise<CaseNoteType[]>
}
