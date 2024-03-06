import { AlertsListQueryParams, PagedList } from '../prisonApi/pagedList'
import { AlertTypeFilter } from '../alertsMetadata'
import { HmppsError } from '../hmppsError'
import { ListMetadata } from '../listMetadata'
import { Alert } from '../prisonApi/alert'

export interface AlertsPageData {
  pagedAlerts: PagedList<Alert>
  listMetadata: ListMetadata<AlertsListQueryParams>
  alertTypes: AlertTypeFilter[]
  activeAlertCount: number
  inactiveAlertCount: number
  fullName: string
  errors: HmppsError[]
}
