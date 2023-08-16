import { PagedListItem } from '../prisonApi/pagedList'

export interface CaseNoteAmendment {
  creationDateTime: string
  authorName: string
  additionalNoteText: string
}

export interface CaseNote extends PagedListItem {
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

export interface CaseNoteForm {
  type: string
  subType: string
  text: string
  date: string
  hours: string
  minutes: string
}
