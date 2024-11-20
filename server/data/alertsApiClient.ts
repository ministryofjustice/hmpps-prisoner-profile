import RestClient from './restClient'
import { mapToQueryString } from '../utils/utils'
import PagedList from './interfaces/prisonApi/PagedList'
import { AlertsApiClient } from './interfaces/alertsApi/alertsApiClient'
import { Alert, AlertChanges, AlertsApiQueryParams, AlertType, CreateAlert } from './interfaces/alertsApi/Alert'
import config from '../config'

export default class AlertsApiRestClient implements AlertsApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Alerts API', config.apis.alertsApi, token)
  }

  async getAlerts(prisonerNumber: string, queryParams: AlertsApiQueryParams): Promise<PagedList<Alert>> {
    // Set defaults then apply queryParams
    const { showAll, ...rest } = queryParams
    const params: AlertsApiQueryParams = {
      size: showAll ? 9999 : 20,
      ...rest,
    }

    return this.restClient.get<PagedList<Alert>>({
      path: `/prisoners/${prisonerNumber}/alerts`,
      query: mapToQueryString(params),
    })
  }

  async getAlertDetails(alertId: string): Promise<Alert> {
    return this.restClient.get<Alert>({ path: `/alerts/${alertId}` })
  }

  async createAlert(prisonerNumber: string, alert: CreateAlert): Promise<Alert> {
    return this.restClient.post<Alert>({ path: `/prisoners/${prisonerNumber}/alerts`, data: alert })
  }

  async updateAlert(alertId: string, alertChanges: AlertChanges): Promise<Alert> {
    return this.restClient.put<Alert>({ path: `/alerts/${alertId}`, data: alertChanges })
  }

  async getAlertTypes(): Promise<AlertType[]> {
    return this.restClient.get<AlertType[]>({ path: '/alert-types' })
  }
}
