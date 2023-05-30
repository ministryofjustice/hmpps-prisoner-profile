import { PagedListItem } from './pagedList'

export interface Alert extends PagedListItem {
  alertId: number
  // These two aren't returned in the API but are defined in the API docs
  // bookingId: number
  // offenderNo: string
  alertType: string
  alertTypeDescription: string
  alertCode: string
  alertCodeDescription: string
  comment?: string
  dateCreated: string
  dateExpires?: string
  expired: boolean
  active: boolean
  addedByFirstName?: string
  addedByLastName?: string
  addedByFullName?: string
  expiredByFirstName?: string
  expiredByLastName?: string
  expiredByFullName?: string
  updateLinkUrl?: string
}
