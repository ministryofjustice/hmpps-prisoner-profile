import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { AlertsPageData } from '../interfaces/pages/alertsPageData'
import { Prisoner } from '../interfaces/prisoner'
import { formatName, generateListMetadata } from '../utils/utils'
import { PagedList, PagedListQueryParams } from '../interfaces/prisonApi/pagedList'
import { SortOption } from '../interfaces/sortSelector'
import { AlertTypeFilter } from '../interfaces/alertsMetadata'

export default class AlertsPageService {
  private prisonApiClient: PrisonApiClient

  constructor(prisonApiClient: PrisonApiClient) {
    this.prisonApiClient = prisonApiClient
  }

  public async get(prisonerData: Prisoner, queryParams: PagedListQueryParams): Promise<AlertsPageData> {
    const isActiveAlertsQuery = queryParams?.alertStatus === 'ACTIVE'

    const { activeAlertCount, inactiveAlertCount, alerts } = await this.prisonApiClient.getInmateDetail(
      prisonerData.bookingId,
    )

    // Get Filter data and map in query params
    const alertTypesFilter: { [key: string]: AlertTypeFilter } = {}
    alerts
      .filter(alert => alert.active === isActiveAlertsQuery)
      .forEach(alert => {
        alertTypesFilter[alert.alertType] = {
          code: alert.alertType,
          description: alert.alertTypeDescription,
          count: alertTypesFilter[alert.alertType] ? alertTypesFilter[alert.alertType].count + 1 : 1,
          checked: false,
        }
      })
    const alertTypes: AlertTypeFilter[] = Object.keys(alertTypesFilter).map(k => ({
      ...alertTypesFilter[k],
      checked: Array.isArray(queryParams.alertType)
        ? queryParams.alertType?.some(type => type === alertTypesFilter[k].code)
        : queryParams.alertType === alertTypesFilter[k].code,
    }))

    let pagedAlerts: PagedList
    if ((activeAlertCount && isActiveAlertsQuery) || (inactiveAlertCount && !isActiveAlertsQuery)) {
      pagedAlerts = await this.prisonApiClient.getAlerts(prisonerData.bookingId, queryParams)
      pagedAlerts.content = pagedAlerts.content.map(alert => ({
        ...alert,
        addedByFullName: formatName(alert.addedByFirstName, undefined, alert.addedByLastName),
        expiredByFullName: formatName(alert.expiredByFirstName, undefined, alert.expiredByLastName),
      }))
    }

    // Determine sort options
    const sortOptions: SortOption[] = [
      { value: 'dateCreated,DESC', description: 'Created (most recent)' },
      { value: 'dateCreated,ASC', description: 'Created (oldest)' },
    ]
    if (!isActiveAlertsQuery) {
      sortOptions.push(
        { value: 'dateExpires,DESC', description: 'Closed (most recent)' },
        { value: 'dateExpires,ASC', description: 'Closed (oldest)' },
      )
    }

    // Remove page and alertStatus params before generating metadata as these values come from API and path respectively
    const cleanedQueryParams: PagedListQueryParams = { ...queryParams }
    delete cleanedQueryParams.page
    delete cleanedQueryParams.alertStatus

    return {
      pagedAlerts,
      listMetadata: generateListMetadata(pagedAlerts, cleanedQueryParams, 'alerts', sortOptions, 'Sort by'),
      alertTypes,
      activeAlertCount,
      inactiveAlertCount,
      fullName: formatName(prisonerData.firstName, prisonerData.middleNames, prisonerData.lastName),
    }
  }
}
