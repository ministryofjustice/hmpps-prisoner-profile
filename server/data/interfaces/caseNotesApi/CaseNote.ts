import { PagedListItem } from '../prisonApi/PagedList'

export interface CaseNoteAmendment {
  creationDateTime: string
  authorUserName: string
  authorName: string
  additionalNoteText: string
}

export default interface CaseNote extends PagedListItem {
  caseNoteId?: string
  offenderIdentifier?: string
  type: string
  typeDescription?: string
  subType: string
  subTypeDescription?: string
  source?: string
  creationDateTime?: string
  occurrenceDateTime: string
  authorName?: string
  authorUserId?: string
  text: string
  locationId?: string
  eventId?: number
  sensitive?: boolean
  amendments?: CaseNoteAmendment[]
}
