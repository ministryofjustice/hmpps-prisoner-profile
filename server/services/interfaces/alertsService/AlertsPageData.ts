import AlertTypeFilter from './AlertsMetadata'
import HmppsError from '../../../interfaces/HmppsError'
import ListMetadata from '../../../interfaces/ListMetadata'
import Alert from '../../../data/interfaces/prisonApi/Alert'
import PagedList, { AlertsListQueryParams } from '../../../data/interfaces/prisonApi/PagedList'

export default interface AlertsPageData {
  pagedAlerts: PagedList<Alert>
  listMetadata: ListMetadata<AlertsListQueryParams>
  alertTypes: AlertTypeFilter[]
  activeAlertCount: number
  inactiveAlertCount: number
  fullName: string
  errors: HmppsError[]
}
