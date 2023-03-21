import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { AlertsPageData } from '../interfaces/pages/alertsPageData'
import { Prisoner } from '../interfaces/prisoner'
import { formatName, generateListMetadata } from '../utils/utils'
import { PagedList, PagedListQueryParams } from '../interfaces/prisonApi/pagedList'
import { SortOption } from '../interfaces/sortSelector'

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

    // Remove page and alertStatus params before generating metadata as these values come from API and path respectively
    const cleanedQueryParams: PagedListQueryParams = { ...queryParams, page: undefined, alertStatus: undefined }

    // Determine sort options
    const sortOptions: SortOption[] = [
      { value: 'dateCreated,DESC', description: 'Created (most recent)' },
      { value: 'dateCreated,ASC', description: 'Created (oldest)' },
    ]
    if (queryParams.alertStatus === 'INACTIVE') {
      sortOptions.push(
        { value: 'dateExpires,DESC', description: 'Closed (most recent)' },
        { value: 'dateExpires,ASC', description: 'Closed (oldest)' },
      )
    }

    return {
      pagedAlerts,
      listMetadata: generateListMetadata(pagedAlerts, cleanedQueryParams, 'alerts', sortOptions, 'Sort by'),
      alertsCodes,
      activeAlertCount,
      inactiveAlertCount,
      fullName: formatName(prisonerData.firstName, prisonerData.middleNames, prisonerData.lastName),
    }
  }
}
