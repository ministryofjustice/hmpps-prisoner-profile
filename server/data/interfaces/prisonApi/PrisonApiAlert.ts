export default interface PrisonApiAlert {
  alertId: string
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
}

export interface AlertForm {
  bookingId?: number
  existingAlerts?: string
  alertType: string
  alertCode: string
  description?: string
  activeFrom: string
  activeTo?: string
}

export interface PrisonApiCreateAlert {
  alertType: string
  alertCode: string
  comment?: string
  alertDate: string
  expiryDate?: string
}

export interface PrisonApiAlertType {
  code: string
  description: string
  activeFlag: 'Y' | 'N'
  subCodes: PrisonApiAlertCode[]
}

export interface PrisonApiAlertCode {
  code: string
  description: string
  activeFlag: 'Y' | 'N'
  parentCode: string
}

export interface PrisonApiAlertChanges {
  expiryDate?: string
  comment?: string
  removeExpiryDate?: boolean
}
