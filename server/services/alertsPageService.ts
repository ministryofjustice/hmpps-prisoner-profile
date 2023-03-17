import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { AlertsPageData } from '../interfaces/pages/alertsPageData'
import { Prisoner } from '../interfaces/prisoner'
import { formatName, generateListMetadata } from '../utils/utils'
import { PagedList, PagedListQueryParams } from '../interfaces/prisonApi/pagedList'

export default class AlertsPageService {
  private prisonApiClient: PrisonApiClient

  constructor(prisonApiClient: PrisonApiClient) {
    this.prisonApiClient = prisonApiClient
  }

  public async get(prisonerData: Prisoner, queryParams: PagedListQueryParams): Promise<AlertsPageData> {
    const { alertsCodes, activeAlertCount, inactiveAlertCount } = await this.prisonApiClient.getInmateDetail(
      prisonerData.bookingId,
    )
    let pagedAlerts: PagedList
    if (
      (activeAlertCount && queryParams?.alertStatus === 'ACTIVE') ||
      (inactiveAlertCount && queryParams?.alertStatus === 'INACTIVE')
    ) {
      pagedAlerts = await this.prisonApiClient.getAlerts(prisonerData.bookingId, queryParams)
    }

    return {
      pagedAlerts,
      listMetadata: generateListMetadata(pagedAlerts, 'alerts'),
      alertsCodes,
      activeAlertCount,
      inactiveAlertCount,
      fullName: formatName(prisonerData.firstName, prisonerData.middleNames, prisonerData.lastName),
    }
  }
}
