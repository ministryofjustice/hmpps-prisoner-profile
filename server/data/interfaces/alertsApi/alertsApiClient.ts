import PagedList from '../prisonApi/PagedList'
import { Alert, AlertChanges, AlertsApiQueryParams, AlertType, CreateAlert } from './Alert'

export interface AlertsApiClient {
  getAlerts(prisonerNumber: string, queryParams: AlertsApiQueryParams): Promise<PagedList<Alert>>
  getAlertDetails(alertId: string): Promise<Alert>
  createAlert(prisonerNumber: string, alert: CreateAlert): Promise<Alert>
  updateAlert(alertId: string, alertChanges: AlertChanges): Promise<Alert>
  getAlertTypes(): Promise<AlertType[]>
}
