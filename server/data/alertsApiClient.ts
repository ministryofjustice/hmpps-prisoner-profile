import { mapToQueryString } from '../utils/utils'
import PagedList from './interfaces/prisonApi/PagedList'
import { AlertsApiClient } from './interfaces/alertsApi/alertsApiClient'
import { Alert, AlertChanges, AlertsApiQueryParams, AlertType, CreateAlert } from './interfaces/alertsApi/Alert'
import config from '../config'
import RestClient from './restClient'

export default class AlertsApiRestClient extends RestClient implements AlertsApiClient {
  constructor(token: string) {
    super('Alerts API', config.apis.alertsApi, token)
  }

  async getAlerts(prisonerNumber: string, queryParams: AlertsApiQueryParams): Promise<PagedList<Alert>> {
    // Set defaults then apply queryParams
    const { showAll, ...rest } = queryParams
    const params: AlertsApiQueryParams = {
      size: showAll ? 9999 : 20,
      ...rest,
    }

    return this.get(
      {
        path: `/prisoners/${prisonerNumber}/alerts`,
        query: mapToQueryString(params),
      },
      this.token,
    )
  }

  async getAlertDetails(alertId: string): Promise<Alert> {
    return this.get({ path: `/alerts/${alertId}` }, this.token)
  }

  async createAlert(prisonerNumber: string, alert: CreateAlert): Promise<Alert> {
    return this.post({ path: `/prisoners/${prisonerNumber}/alerts`, data: alert }, this.token)
  }

  async updateAlert(alertId: string, alertChanges: AlertChanges): Promise<Alert> {
    return this.put({ path: `/alerts/${alertId}`, data: alertChanges }, this.token)
  }

  async getAlertTypes(): Promise<AlertType[]> {
    return this.get({ path: '/alert-types' }, this.token)
  }
}
