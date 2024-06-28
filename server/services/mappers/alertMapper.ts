import PrisonApiAlert, {
  AlertForm,
  PrisonApiAlertChanges,
  PrisonApiAlertCode,
  PrisonApiAlertType,
  PrisonApiCreateAlert,
} from '../../data/interfaces/prisonApi/PrisonApiAlert'
import {
  Alert,
  AlertChanges,
  AlertCode,
  AlertSummaryData,
  AlertType,
  CreateAlert,
} from '../../data/interfaces/alertsApi/Alert'
import { formatName, formatNamePart } from '../../utils/utils'
import { formatDateISO, parseDate } from '../../utils/dateHelpers'
import AlertFlagLabel from '../../interfaces/AlertFlagLabels'
import AlertTypeFilter from '../interfaces/alertsService/AlertsMetadata'

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
    activeToLastSetAt: prisonApiAlert.dateExpires ? prisonApiAlert.modifiedDateTime : undefined,
    activeToLastSetByDisplayName:
      prisonApiAlert.dateExpires && prisonApiAlert.expiredByFirstName && prisonApiAlert.expiredByLastName
        ? formatName(prisonApiAlert.expiredByFirstName, undefined, prisonApiAlert.expiredByLastName)
        : undefined,
  }
}

export const capitaliseAlertDisplayNames = (alert: Alert): Alert => {
  if (!alert) return null

  return {
    ...alert,
    createdByDisplayName: alert.createdByDisplayName.split(' ').map(formatNamePart).join(' '),
    lastModifiedByDisplayName: alert.lastModifiedByDisplayName
      ? alert.lastModifiedByDisplayName.split(' ').map(formatNamePart).join(' ')
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

export const toAlertsApiCreateAlert = (alertForm: AlertForm): CreateAlert => {
  return {
    alertCode: alertForm.alertCode,
    description: alertForm.description,
    activeFrom: formatDateISO(parseDate(alertForm.activeFrom)),
    activeTo: alertForm.activeTo ? formatDateISO(parseDate(alertForm.activeTo)) : null,
  }
}

export const toAlertCode = (prisonApiAlertCode: PrisonApiAlertCode): AlertCode => {
  if (!prisonApiAlertCode) return null

  return {
    code: prisonApiAlertCode.code,
    description: prisonApiAlertCode.description,
    isActive: prisonApiAlertCode.activeFlag === 'Y',
    alertTypeCode: prisonApiAlertCode.parentCode,
  }
}

export const toAlertType = (prisonApiAlertType: PrisonApiAlertType): AlertType => {
  if (!prisonApiAlertType) return null

  return {
    code: prisonApiAlertType.code,
    description: prisonApiAlertType.description,
    isActive: prisonApiAlertType.activeFlag === 'Y',
    alertCodes: prisonApiAlertType.subCodes?.length ? prisonApiAlertType.subCodes.map(toAlertCode) : [],
  }
}

const toAlertFlagLabels = (alerts: Alert[], alertFlags: AlertFlagLabel[]): AlertFlagLabel[] => {
  return alertFlags
    .map(flag => {
      const alertIds = alerts
        .filter(alert => alert.isActive && flag.alertCodes.includes(alert.alertCode.code))
        .map(alert => alert.alertUuid)
      return { ...flag, alertIds } as AlertFlagLabel
    })
    .filter(alert => alert.alertIds?.length)
}

export const toAlertTypesFilters = (alerts: Alert[]) => {
  const createAlertTypeFilter = (filter: { [key: string]: AlertTypeFilter }, alert: Alert) => ({
    ...filter,
    [alert.alertCode.alertTypeCode]: {
      code: alert.alertCode.alertTypeCode,
      description: alert.alertCode.alertTypeDescription,
      count: (filter[alert.alertCode.alertTypeCode]?.count ?? 0) + 1,
      checked: false,
    },
  })

  return alerts.reduce(
    (acc, alert) => {
      if (alert.isActive) {
        acc.activeAlertTypesFilter = createAlertTypeFilter(acc.activeAlertTypesFilter, alert)
      } else {
        acc.inactiveAlertTypesFilter = createAlertTypeFilter(acc.inactiveAlertTypesFilter, alert)
      }
      return acc
    },
    { activeAlertTypesFilter: {}, inactiveAlertTypesFilter: {} },
  )
}

/* eslint-disable no-shadow, no-plusplus */
export const toAlertSummaryData = (alerts: Alert[], alertFlags: AlertFlagLabel[]): AlertSummaryData => {
  const toAlertCounts = (alerts: Alert[]) => {
    return alerts.reduce(
      (acc, alert) => {
        if (alert.isActive) {
          acc.activeAlertCount++
        } else {
          acc.inactiveAlertCount++
        }
        return acc
      },
      { activeAlertCount: 0, inactiveAlertCount: 0 },
    )
  }

  return {
    ...toAlertCounts(alerts),
    ...toAlertTypesFilters(alerts),
    alertFlags: toAlertFlagLabels(alerts, alertFlags),
  }
}
