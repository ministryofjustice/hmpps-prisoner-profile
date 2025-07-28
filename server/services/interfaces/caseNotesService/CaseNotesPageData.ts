import HmppsError from '../../../interfaces/HmppsError'
import ListMetadata from '../../../interfaces/ListMetadata'
import CaseNote, { CaseNoteAmendment } from '../../../data/interfaces/caseNotesApi/CaseNote'
import CaseNoteType from '../../../data/interfaces/caseNotesApi/CaseNoteType'
import PagedList, { CaseNotesListQueryParams } from '../../../data/interfaces/prisonApi/PagedList'

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

export default interface CaseNotesPageData {
  pagedCaseNotes: PagedList<CaseNotePageData>
  listMetadata: ListMetadata<CaseNotesListQueryParams>
  hasCaseNotes: boolean
  caseNoteTypes: CaseNoteType[]
  fullName: string
  errors: HmppsError[]
}
