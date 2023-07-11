import { PagedList } from '../prisonApi/pagedList'
import { HmppsError } from '../hmppsError'
import { ListMetadata } from '../listMetadata'
import { CaseNoteType } from '../caseNoteType'

export interface CaseNotesPageData {
  pagedCaseNotes: PagedList
  listMetadata: ListMetadata
  caseNoteTypes: CaseNoteType[]
  fullName: string
  errors: HmppsError[]
}
