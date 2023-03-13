import { PagedAlerts } from '../prisonApi/pagedAlerts'

export interface AlertsPageData {
  pagedAlerts: PagedAlerts
  alertsCodes: string[]
  activeAlertCount: number
  inactiveAlertCount: number
  fullName: string
}
