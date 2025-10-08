import { AlertFlagLabel } from '@ministryofjustice/hmpps-connect-dps-shared-items'
import { PagedListItem } from '../prisonApi/PagedList'
import AlertTypeFilter from '../../../services/interfaces/alertsService/AlertsMetadata'
import { QueryParams } from '../../../interfaces/QueryParams'

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
  alertCode: string
  description: string
  authorisedBy?: string
  activeFrom: string
  activeTo?: string
}

export interface AlertsApiQueryParams extends QueryParams {
  isActive?: boolean
  size?: number
  page?: number
  sort?: string[]
  activeFromEnd?: string
  activeFromStart?: string
  alertType?: string | string[]
  showAll?: boolean
}

export interface AlertSummaryData {
  activeAlertCount?: number
  inactiveAlertCount?: number
  activeAlertTypesFilter?: { [key: string]: AlertTypeFilter }
  inactiveAlertTypesFilter?: { [key: string]: AlertTypeFilter }
  alertFlags?: AlertFlagLabel[]
  apiUnavailable: boolean
  highPublicInterestPrisoner?: boolean
}

export interface AlertForm {
  existingAlerts?: string
  alertType?: string
  alertCode?: string
  description?: string
  activeFrom?: string
  activeTo?: string
}
