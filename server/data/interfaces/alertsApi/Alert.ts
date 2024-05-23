import { PagedListItem } from '../prisonApi/PagedList'

export interface Alert extends PagedListItem {
  alertUuid?: string
  prisonNumber?: string
  alertCode: {
    alertTypeCode: string
    alertTypeDescription: string
    code: string
    description: string
  }
  description: string
  authorisedBy?: string
  activeFrom: string
  activeTo?: string
  isActive: boolean
  comments?: [
    {
      commentUuid: string
      comment: string
      createdAt: string
      createdBy: string
      createdByDisplayName: string
    },
  ]
  createdAt?: string
  createdBy?: string
  createdByDisplayName: string
  lastModifiedAt?: string
  lastModifiedBy?: string
  lastModifiedByDisplayName?: string
  activeToLastSetAt?: string
  activeToLastSetBy?: string
  activeToLastSetByDisplayName?: string
}

export interface AlertChanges {
  description?: string
  authorisedBy?: string
  activeFrom?: string
  activeTo?: string
  appendComment?: string
}

export interface AlertCode {
  alertTypeCode: string
  code: string
  description: string
  listSequence?: number
  isActive: boolean
  createdAt?: string
  createdBy?: string
  modifiedAt?: string
  modifiedBy?: string
  deactivatedAt?: string
  deactivatedBy?: string
}

export interface AlertType {
  code: string
  description: string
  listSequence?: number
  isActive: boolean
  createdAt?: string
  createdBy?: string
  modifiedAt?: string
  modifiedBy?: string
  deactivatedAt?: string
  deactivatedBy?: string
  alertCodes: AlertCode[]
}

export interface CreateAlert {
  prisonNumber: string
  alertCode: string
  description: string
  authorisedBy?: string
  activeFrom: string
  activeTo?: string
}
