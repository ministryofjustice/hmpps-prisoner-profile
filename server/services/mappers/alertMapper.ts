import PrisonApiAlert, {
  AlertForm,
  PrisonApiAlertChanges,
  PrisonApiCreateAlert,
} from '../../data/interfaces/prisonApi/PrisonApiAlert'
import { Alert, AlertChanges } from '../../data/interfaces/alertsApi/Alert'
import { formatName } from '../../utils/utils'
import { formatDateISO, parseDate } from '../../utils/dateHelpers'

/**
 * Map from the Prison API type [PrisonApiAlerts]
 * into the Alerts API and view model type [Alert]
 */
export const toAlert = (prisonApiAlert: PrisonApiAlert): Alert => {
  if (!prisonApiAlert) return null

  return {
    alertUuid: String(prisonApiAlert.alertId),
    alertCode: {
      alertTypeCode: prisonApiAlert.alertType,
      alertTypeDescription: prisonApiAlert.alertTypeDescription,
      code: prisonApiAlert.alertCode,
      description: prisonApiAlert.alertCodeDescription,
    },
    description: prisonApiAlert.comment,
    activeFrom: prisonApiAlert.dateCreated,
    activeTo: prisonApiAlert.dateExpires,
    createdAt: prisonApiAlert.dateCreated,
    createdByDisplayName: formatName(prisonApiAlert.addedByFirstName, undefined, prisonApiAlert.addedByLastName),
    isActive: prisonApiAlert.active,
    lastModifiedAt: prisonApiAlert.modifiedDateTime,
    lastModifiedByDisplayName:
      prisonApiAlert.expiredByFirstName && prisonApiAlert.expiredByLastName
        ? formatName(prisonApiAlert.expiredByFirstName, undefined, prisonApiAlert.expiredByLastName)
        : undefined,
  }
}

/**
 * Map from the Alerts API and view model type [Alert]
 * into the Prison API type [PrisonApiAlerts]
 */
export const toPrisonApiAlert = (alert: Alert): PrisonApiAlert => {
  if (!alert) return null

  return {
    alertId: alert.alertUuid,
    alertType: alert.alertCode.alertTypeCode,
    alertTypeDescription: alert.alertCode.alertTypeDescription,
    alertCode: alert.alertCode.code,
    alertCodeDescription: alert.alertCode.description,
    comment: alert.description,
    dateCreated: alert.activeFrom,
    dateExpires: alert.activeTo,
    modifiedDateTime: alert.lastModifiedAt,
    expired: !alert.isActive,
    active: alert.isActive,
  }
}

export const toPrisonAlertChanges = (alertChanges: AlertChanges): PrisonApiAlertChanges => {
  if (!alertChanges) return null

  return {
    comment: alertChanges.description,
    expiryDate: alertChanges.activeTo,
    removeExpiryDate: !alertChanges.activeTo,
  }
}

export const toPrisonApiCreateAlert = (alertForm: AlertForm): PrisonApiCreateAlert => {
  return {
    alertType: alertForm.alertType,
    alertCode: alertForm.alertCode,
    comment: alertForm.description,
    alertDate: formatDateISO(parseDate(alertForm.activeFrom)),
    expiryDate: alertForm.activeTo ? formatDateISO(parseDate(alertForm.activeTo)) : null,
  }
}
