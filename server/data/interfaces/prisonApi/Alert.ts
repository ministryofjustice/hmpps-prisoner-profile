import { PagedListItem } from './PagedList'

export default interface Alert extends PagedListItem {
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
  modifiedDateTime?: string
  dateExpires?: string
  expired: boolean
  active: boolean
  addedByFirstName?: string
  addedByLastName?: string
  addedByFullName?: string
  expiredByFirstName?: string
  expiredByLastName?: string
  expiredByFullName?: string
  addMoreDetailsLinkUrl?: string
  closeAlertLinkUrl?: string
}

export interface AlertForm {
  bookingId?: number
  existingAlerts?: string
  alertType: string
  alertCode: string
  comment: string
  alertDate: string
  expiryDate?: string
  expired?: boolean
}

export interface AlertType {
  code: string
  description: string
  activeFlag: 'Y' | 'N'
  subCodes: AlertCode[]
}

export interface AlertCode {
  code: string
  description: string
  activeFlag: 'Y' | 'N'
  parentCode: string
}

export interface AlertChanges {
  expiryDate?: string
  comment?: string
  removeExpiryDate?: boolean
}
