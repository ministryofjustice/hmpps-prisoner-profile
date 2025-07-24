import { isBefore, isFuture } from 'date-fns'
import AlertsPageData from './interfaces/alertsService/AlertsPageData'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import { formatName, generateListMetadata } from '../utils/utils'
import { SortOption } from '../interfaces/SortParams'
import AlertTypeFilter from './interfaces/alertsService/AlertsMetadata'
import { formatDateISO, isRealDate, parseDate } from '../utils/dateHelpers'
import HmppsError from '../interfaces/HmppsError'
import { RestClientBuilder } from '../data'
import PagedList, { AlertsListQueryParams } from '../data/interfaces/prisonApi/PagedList'
import { capitaliseAlertDisplayNames, toAlertsApiCreateAlert } from './mappers/alertMapper'
import {
  Alert,
  AlertChanges,
  AlertForm,
  AlertsApiQueryParams,
  AlertSummaryData,
} from '../data/interfaces/alertsApi/Alert'
import { AlertsApiClient } from '../data/interfaces/alertsApi/alertsApiClient'

export default class AlertsService {
  constructor(private readonly alertsApiClientBuilder: RestClientBuilder<AlertsApiClient>) {}

  /**
   * Validate alert filters and return errors if appropriate
   *
   * Only `Date from` and `Date to (latest)` can be in error
   *
   * @param from
   * @param to
   * @private
   */
  private validateFilters(from: string, to: string) {
    const errors: HmppsError[] = []

    if (from && !isRealDate(from)) {
      errors.push({ text: `'Date from (earliest)' must be a real date`, href: '#from' })
    } else if (from && isFuture(parseDate(from))) {
      errors.push({ text: `'Date from (earliest)' must be today or in the past`, href: '#from' })
    }

    if (to && !isRealDate(to)) {
      errors.push({ text: `'Date to (latest)' must be a real date`, href: '#to' })
    } else if (to && from && isBefore(parseDate(to), parseDate(from))) {
      errors.push({ text: `'Date to (latest)' must be after or the same as 'Date from (earliest)'`, href: '#to' })
    }

    return errors
  }

  /**
   * Map query params from the browser to values suitable for sending to the Alerts API.
   *
   * @param queryParams
   * @private
   */
  private mapToAlertsApiParams(queryParams: AlertsListQueryParams): AlertsApiQueryParams {
    /* Add sort param createdAt to all queries and lastModifiedAt to inactive queries so results are ordered in an expected way */
    const sortParams = [queryParams.sort]
      .flat()
      .filter(Boolean)
      .map(s => {
        return s.replace('dateCreated', 'activeFrom').replace('dateExpires', 'activeTo')
      })
    if (sortParams.some(s => s.includes('activeTo'))) {
      const direction = sortParams.some(s => s.includes('ASC')) ? 'ASC' : 'DESC'
      sortParams.push(`lastModifiedAt,${direction}`)
    }
    const direction = sortParams.some(s => s.includes('ASC')) ? 'ASC' : 'DESC'
    sortParams.push(`createdAt,${direction}`)

    return {
      ...(queryParams.alertType && { alertType: queryParams.alertType }),
      ...(queryParams.from && { activeFromStart: formatDateISO(parseDate(queryParams.from)) }),
      ...(queryParams.to && { activeFromEnd: formatDateISO(parseDate(queryParams.to)) }),
      ...(queryParams.page && { page: Number(queryParams.page) - 1 }), // Change page to zero based for API query
      sort: sortParams,
      isActive: queryParams.alertStatus === 'ACTIVE',
      size: queryParams?.showAll ? 9999 : 20,
    }
  }

  /**
   * Handle request for alerts
   *
   * @param clientToken
   * @param prisonerData
   * @param alertSummaryData
   * @param queryParams
   */
  public async get(
    clientToken: string,
    prisonerData: Prisoner,
    alertSummaryData: AlertSummaryData,
    queryParams: AlertsListQueryParams,
  ): Promise<AlertsPageData> {
    const isActiveAlertsQuery = queryParams?.alertStatus === 'ACTIVE'
    const alertsApiClient = this.alertsApiClientBuilder(clientToken)

    const { activeAlertCount, inactiveAlertCount, activeAlertTypesFilter, inactiveAlertTypesFilter } = alertSummaryData

    const alertTypesFilter = isActiveAlertsQuery ? activeAlertTypesFilter : inactiveAlertTypesFilter

    const alertTypes: AlertTypeFilter[] = Object.keys(alertTypesFilter)
      .map(k => ({
        ...alertTypesFilter[k],
        checked: Array.isArray(queryParams.alertType)
          ? queryParams.alertType?.some(type => type === alertTypesFilter[k].code)
          : queryParams.alertType === alertTypesFilter[k].code,
      }))
      .sort((a, b) => a.description.localeCompare(b.description))

    // Determine sort options
    const sortOptions: SortOption[] = [
      { value: 'dateCreated,DESC', description: 'Start date (most recent)' },
      { value: 'dateCreated,ASC', description: 'Start date (oldest)' },
    ]
    if (!isActiveAlertsQuery) {
      sortOptions.push(
        { value: 'dateExpires,DESC', description: 'Closed (most recent)' },
        { value: 'dateExpires,ASC', description: 'Closed (oldest)' },
      )
    }

    const errors = this.validateFilters(queryParams.from, queryParams.to)
    const shouldGetActiveAlerts = activeAlertCount && isActiveAlertsQuery
    const shouldGetInactiveAlerts = inactiveAlertCount && !isActiveAlertsQuery

    const pagedAlerts =
      !errors.length && (shouldGetActiveAlerts || shouldGetInactiveAlerts)
        ? await this.getPagedAlerts(alertsApiClient, prisonerData, queryParams)
        : null

    // Remove page and alertStatus params before generating metadata as these values come from API and path respectively
    const params = queryParams
    delete params.page
    delete params.alertStatus

    return {
      pagedAlerts,
      listMetadata: generateListMetadata(pagedAlerts, params, 'alert', sortOptions, 'Sort by', true),
      alertTypes,
      activeAlertCount,
      inactiveAlertCount,
      fullName: formatName(prisonerData.firstName, prisonerData.middleNames, prisonerData.lastName),
      errors,
    }
  }

  private async getPagedAlerts(
    alertsApiClient: AlertsApiClient,
    prisonerData: Prisoner,
    queryParams: AlertsListQueryParams,
  ): Promise<PagedList<Alert> | null> {
    const pagedAlerts = await alertsApiClient.getAlerts(
      prisonerData.prisonerNumber,
      this.mapToAlertsApiParams(queryParams),
    )
    return {
      ...pagedAlerts,
      content: pagedAlerts.content.map(capitaliseAlertDisplayNames),
    }
  }

  public async createAlert(
    clientToken: string,
    { prisonerNumber, alertForm }: { prisonerNumber: string; alertForm: AlertForm },
  ) {
    const alertsApiClient = this.alertsApiClientBuilder(clientToken)
    const alert = await alertsApiClient.createAlert(prisonerNumber, toAlertsApiCreateAlert(alertForm))

    return capitaliseAlertDisplayNames(alert)
  }

  public async getAlertDetails(token: string, alertId: string) {
    const alertsApiClient = this.alertsApiClientBuilder(token)
    const alert = await alertsApiClient.getAlertDetails(alertId)

    return capitaliseAlertDisplayNames(alert)
  }

  public async updateAlert(clientToken: string, alertId: string, alertChanges: AlertChanges) {
    const alertsApiClient = this.alertsApiClientBuilder(clientToken)
    const alert = await alertsApiClient.updateAlert(alertId, alertChanges)

    return capitaliseAlertDisplayNames(alert)
  }

  public async getAlertTypes(token: string) {
    const alertsApiClient = this.alertsApiClientBuilder(token)
    const alertTypes = await alertsApiClient.getAlertTypes()

    return alertTypes.filter(alertType => alertType.alertCodes?.length) // Exclude alert types with no alert codes as they cannot be selected
  }
}
