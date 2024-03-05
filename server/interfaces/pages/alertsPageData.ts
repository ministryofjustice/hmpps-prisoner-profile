import { AlertTypeFilter } from '../alertsMetadata'
import { HmppsError } from '../hmppsError'
import { ListMetadata } from '../listMetadata'
import Alert from '../../data/interfaces/prisonApi/Alert'
import PagedList, { AlertsListQueryParams } from '../../data/interfaces/prisonApi/PagedList'

export interface AlertsPageData {
  pagedAlerts: PagedList<Alert>
  listMetadata: ListMetadata<AlertsListQueryParams>
  alertTypes: AlertTypeFilter[]
  activeAlertCount: number
  inactiveAlertCount: number
  fullName: string
  errors: HmppsError[]
}
