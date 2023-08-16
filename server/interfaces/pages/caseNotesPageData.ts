import { PagedList } from '../prisonApi/pagedList'
import { HmppsError } from '../hmppsError'
import { ListMetadata } from '../listMetadata'
import { CaseNoteType } from '../caseNoteType'
import { CaseNote, CaseNoteAmendment } from '../caseNotesApi/caseNote'

export interface CaseNoteAmendmentPageData extends CaseNoteAmendment {
  authorName: string
}
export interface CaseNotePageData extends CaseNote {
  authorName: string
  amendments?: CaseNoteAmendmentPageData[]
  addMoreLinkUrl: string
  deleteLinkUrl?: string
  printIncentiveWarningLink?: string
  printIncentiveEncouragementLink?: string
}

export interface CaseNotesPageData {
  pagedCaseNotes: PagedList<CaseNotePageData>
  listMetadata: ListMetadata
  caseNoteTypes: CaseNoteType[]
  fullName: string
  errors: HmppsError[]
}
