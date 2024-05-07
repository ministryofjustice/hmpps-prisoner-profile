import { PagedListItem } from '../prisonApi/PagedList'

export interface Alert extends PagedListItem {
  alertUuid: string
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
}

export interface AlertChanges {
  description?: string
  authorisedBy?: string
  activeFrom?: string
  activeTo?: string
  appendComment?: string
}
