import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { PagedAlerts, PagedAlertsOptions } from '../interfaces/prisonApi/pagedAlerts'
import { AlertsPageData } from '../interfaces/pages/alertsPageData'
import { Prisoner } from '../interfaces/prisoner'
import { formatName } from '../utils/utils'

export default class AlertsPageService {
  private prisonApiClient: PrisonApiClient

  constructor(prisonApiClient: PrisonApiClient) {
    this.prisonApiClient = prisonApiClient
  }

  public async get(prisonerData: Prisoner, options?: PagedAlertsOptions): Promise<AlertsPageData> {
    const { alertsCodes, activeAlertCount, inactiveAlertCount } = await this.prisonApiClient.getInmateDetail(
      prisonerData.bookingId,
    )
    let pagedAlerts: PagedAlerts
    if (
      (activeAlertCount && !options) ||
      (activeAlertCount && options?.alertStatus === 'ACTIVE') ||
      (inactiveAlertCount && options?.alertStatus === 'INACTIVE')
    ) {
      pagedAlerts = await this.prisonApiClient.getAlerts(prisonerData.bookingId, options)
    }

    return {
      pagedAlerts,
      alertsCodes,
      activeAlertCount,
      inactiveAlertCount,
      fullName: formatName(prisonerData.firstName, prisonerData.middleNames, prisonerData.lastName),
    }
  }
}
