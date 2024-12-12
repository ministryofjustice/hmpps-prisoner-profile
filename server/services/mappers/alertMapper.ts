import dpsShared from '@ministryofjustice/hmpps-connect-dps-shared-items'
import { Alert, AlertForm, AlertSummaryData, CreateAlert } from '../../data/interfaces/alertsApi/Alert'
import { formatNamePart } from '../../utils/utils'
import { formatDateISO, parseDate } from '../../utils/dateHelpers'
import AlertTypeFilter from '../interfaces/alertsService/AlertsMetadata'
import { Result } from '../../utils/result/result'
import PagedList from '../../data/interfaces/prisonApi/PagedList'

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

export const toAlertsApiCreateAlert = (alertForm: AlertForm): CreateAlert => {
  return {
    alertCode: alertForm.alertCode,
    description: alertForm.description,
    activeFrom: formatDateISO(parseDate(alertForm.activeFrom)),
    activeTo: alertForm.activeTo ? formatDateISO(parseDate(alertForm.activeTo)) : null,
  }
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
export const toAlertSummaryData = (alerts: Result<PagedList<Alert>>): AlertSummaryData => {
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

  if (!alerts.isFulfilled()) return { apiUnavailable: true }

  const alertsContent = alerts.getOrThrow().content

  return {
    ...toAlertCounts(alertsContent),
    ...toAlertTypesFilters(alertsContent),
    alertFlags: dpsShared.alertFlags.getAlertFlagLabelsForAlerts(alertsContent),
    apiUnavailable: false,
  }
}
