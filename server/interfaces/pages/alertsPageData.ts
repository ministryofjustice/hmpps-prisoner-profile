import { PagedList } from '../prisonApi/pagedList'
import { AlertTypeFilter } from '../alertsMetadata'
import { HmppsError } from '../hmppsError'
import { ListMetadata } from '../listMetadata'

export interface AlertsPageData {
  pagedAlerts: PagedList
  listMetadata: ListMetadata
  alertTypes: AlertTypeFilter[]
  activeAlertCount: number
  inactiveAlertCount: number
  fullName: string
  errors: HmppsError[]
}
