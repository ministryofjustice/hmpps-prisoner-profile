import PagedList, { AlertsListQueryParams } from '../prisonApi/PagedList'
import { Alert, AlertChanges, AlertType, CreateAlert } from './Alert'

export interface AlertsApiClient {
  getAlerts(prisonerNumber: string, queryParams: AlertsListQueryParams): Promise<PagedList<Alert>>
  getAlertDetails(alertId: string): Promise<Alert>
  createAlert(alert: CreateAlert): Promise<Alert>
  updateAlert(alertId: string, alertChanges: AlertChanges): Promise<Alert>
  getAlertTypes(): Promise<AlertType[]>
}
