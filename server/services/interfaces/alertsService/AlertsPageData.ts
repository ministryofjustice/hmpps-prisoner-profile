import AlertTypeFilter from './AlertsMetadata'
import HmppsError from '../../../interfaces/HmppsError'
import ListMetadata from '../../../interfaces/ListMetadata'
import PagedList, { AlertsListQueryParams } from '../../../data/interfaces/prisonApi/PagedList'
import { Alert } from '../../../data/interfaces/alertsApi/Alert'

export default interface AlertsPageData {
  pagedAlerts: PagedList<Alert>
  listMetadata: ListMetadata<AlertsListQueryParams>
  alertTypes: AlertTypeFilter[]
  activeAlertCount: number
  inactiveAlertCount: number
  errors: HmppsError[]
}
