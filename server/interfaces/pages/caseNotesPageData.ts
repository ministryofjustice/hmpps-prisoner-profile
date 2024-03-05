import { HmppsError } from '../hmppsError'
import { ListMetadata } from '../listMetadata'
import CaseNote, { CaseNoteAmendment } from '../../data/interfaces/caseNotesApi/CaseNote'
import CaseNoteType from '../../data/interfaces/caseNotesApi/CaseNoteType'
import PagedList, { CaseNotesListQueryParams } from '../../data/interfaces/prisonApi/PagedList'

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
  listMetadata: ListMetadata<CaseNotesListQueryParams>
  caseNoteTypes: CaseNoteType[]
  fullName: string
  errors: HmppsError[]
}
