import { isBefore, isFuture } from 'date-fns'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { AlertsPageData } from '../interfaces/pages/alertsPageData'
import { Prisoner } from '../interfaces/prisoner'
import { formatName, generateListMetadata } from '../utils/utils'
import { PagedList, PagedListQueryParams } from '../interfaces/prisonApi/pagedList'
import { SortOption } from '../interfaces/sortSelector'
import { AlertTypeFilter } from '../interfaces/alertsMetadata'
import { formatDateISO, isRealDate, parseDate } from '../utils/dateHelpers'
import { HmppsError } from '../interfaces/hmppsError'

export default class AlertsPageService {
  private prisonApiClient: PrisonApiClient

  constructor(prisonApiClient: PrisonApiClient) {
    this.prisonApiClient = prisonApiClient
  }

  private validateFilters(from: string, to: string) {
    const errors: HmppsError[] = []

    if (from && !isRealDate(from)) {
      errors.push({ text: `'Date from' must be a real date`, href: '#from' })
    } else if (from && isFuture(parseDate(from))) {
      errors.push({ text: `'Date from' must be today or in the past`, href: '#from' })
    }

    if (to && !isRealDate(to)) {
      errors.push({ text: `'Date to' must be a real date`, href: '#to' })
    } else if (to && from && isBefore(parseDate(to), parseDate(from))) {
      errors.push({ text: `'Date to' must be after or the same as 'Date from'`, href: '#to' })
    }

    return errors
  }

  /**
   * Map query params from the browser to values suitable for sending to the API.
   *
   * @param queryParams
   * @private
   */
  private mapToApiParams(queryParams: PagedListQueryParams) {
    const apiParams = { ...queryParams }

    apiParams.from = apiParams.from && formatDateISO(parseDate(apiParams.from))
    apiParams.to = apiParams.to && formatDateISO(parseDate(apiParams.to))
    apiParams.page = apiParams.page && +apiParams.page - 1 // Change page to zero based for API query

    return apiParams
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

    const errors = this.validateFilters(queryParams.from, queryParams.to)

    let pagedAlerts: PagedList

    if (!errors.length) {
      if ((activeAlertCount && isActiveAlertsQuery) || (inactiveAlertCount && !isActiveAlertsQuery)) {
        pagedAlerts = await this.prisonApiClient.getAlerts(prisonerData.bookingId, this.mapToApiParams(queryParams))
        pagedAlerts.content = pagedAlerts.content.map(alert => ({
          ...alert,
          addedByFullName: formatName(alert.addedByFirstName, undefined, alert.addedByLastName),
          expiredByFullName: formatName(alert.expiredByFirstName, undefined, alert.expiredByLastName),
        }))
      }
    }

    return {
      pagedAlerts,
      listMetadata: generateListMetadata(
        pagedAlerts,
        { ...queryParams, page: undefined, alertStatus: undefined }, // Remove page and alertStatus params before generating metadata as these values come from API and path respectively
        'alerts',
        sortOptions,
        'Sort by',
      ),
      alertTypes,
      activeAlertCount,
      inactiveAlertCount,
      fullName: formatName(prisonerData.firstName, prisonerData.middleNames, prisonerData.lastName),
      errors,
    }
  }
}
