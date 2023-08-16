import { PagedList } from '../prisonApi/pagedList'
import { HmppsError } from '../hmppsError'
import { ListMetadata } from '../listMetadata'
import { CaseNoteType } from '../caseNoteType'
import { CaseNote } from '../caseNotesApi/caseNote'

export interface CaseNotesPageData {
  pagedCaseNotes: PagedList<CaseNote>
  listMetadata: ListMetadata
  caseNoteTypes: CaseNoteType[]
  fullName: string
  errors: HmppsError[]
}
