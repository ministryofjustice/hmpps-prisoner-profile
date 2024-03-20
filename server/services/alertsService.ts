import { isBefore, isFuture } from 'date-fns'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import AlertsPageData from './interfaces/alertsService/AlertsPageData'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import { formatName, generateListMetadata } from '../utils/utils'
import { SortOption } from '../interfaces/SortParams'
import AlertTypeFilter from './interfaces/alertsService/AlertsMetadata'
import { formatDateISO, isRealDate, parseDate } from '../utils/dateHelpers'
import HmppsError from '../interfaces/HmppsError'
import Alert, { AlertChanges, AlertForm } from '../data/interfaces/prisonApi/Alert'
import { RestClientBuilder } from '../data'
import PagedList, { AlertsListQueryParams } from '../data/interfaces/prisonApi/PagedList'
import AlertView from './interfaces/alertsService/AlertView'

export default class AlertsService {
  constructor(private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>) {}

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
   * Map query params from the browser to values suitable for sending to the API.
   *
   * @param queryParams
   * @private
   */
  private mapToApiParams(queryParams: AlertsListQueryParams) {
    const apiParams = { ...queryParams }

    if (apiParams.from) apiParams.from = apiParams.from && formatDateISO(parseDate(apiParams.from))
    if (apiParams.to) apiParams.to = apiParams.to && formatDateISO(parseDate(apiParams.to))
    if (apiParams.page) apiParams.page = apiParams.page && +apiParams.page - 1 // Change page to zero based for API query

    return apiParams
  }

  /**
   * Handle request for alerts
   *
   * @param clientToken
   * @param prisonerData
   * @param queryParams
   * @param canUpdateAlert
   */
  public async get(
    clientToken: string,
    prisonerData: Prisoner,
    queryParams: AlertsListQueryParams,
    canUpdateAlert: boolean,
  ): Promise<AlertsPageData> {
    const isActiveAlertsQuery = queryParams?.alertStatus === 'ACTIVE'
    const prisonApiClient = this.prisonApiClientBuilder(clientToken)
    const { activeAlertCount, inactiveAlertCount, alerts } = await prisonApiClient.getInmateDetail(
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
        ? await this.getPagedAlerts(prisonApiClient, prisonerData, queryParams, canUpdateAlert)
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
    prisonApiClient: PrisonApiClient,
    prisonerData: Prisoner,
    queryParams: AlertsListQueryParams,
    canUpdateAlert: boolean,
  ): Promise<PagedList<AlertView> | null> {
    const pagedAlerts = await prisonApiClient.getAlerts(prisonerData.bookingId, this.mapToApiParams(queryParams))

    const alertContentsForView = pagedAlerts.content.map<AlertView>((alert: Alert) => {
      const alertUpdatable = canUpdateAlert && alert.active && alert.alertCode !== 'DOCGM'
      return {
        ...alert,
        addMoreDetailsLinkUrl: alertUpdatable
          ? `/prisoner/${prisonerData.prisonerNumber}/alerts/${alert.alertId}/add-more-details`
          : null,
        closeAlertLinkUrl:
          alertUpdatable && !alert.dateExpires
            ? `/prisoner/${prisonerData.prisonerNumber}/alerts/${alert.alertId}/close`
            : null,
        changeEndDateLinkUrl:
          alertUpdatable && alert.dateExpires
            ? `/prisoner/${prisonerData.prisonerNumber}/alerts/${alert.alertId}/change-end-date`
            : null,
        addedByFullName: formatName(alert.addedByFirstName, undefined, alert.addedByLastName),
        expiredByFullName: formatName(alert.expiredByFirstName, undefined, alert.expiredByLastName),
      }
    })

    return {
      ...pagedAlerts,
      content: alertContentsForView,
    }
  }

  public async createAlert(token: string, bookingId: number, alert: AlertForm) {
    const prisonApiClient = this.prisonApiClientBuilder(token)

    return prisonApiClient.createAlert(bookingId, {
      ...alert,
      alertDate: formatDateISO(parseDate(alert.alertDate)),
      expiryDate: alert.expiryDate ? formatDateISO(parseDate(alert.expiryDate)) : null,
    })
  }

  public async getAlertDetails(token: string, bookingId: number, alertId: number) {
    const prisonApiClient = this.prisonApiClientBuilder(token)

    const alert = await prisonApiClient.getAlertDetails(bookingId, alertId)

    return {
      ...alert,
      addedByFullName: formatName(alert.addedByFirstName, undefined, alert.addedByLastName),
      expiredByFullName: formatName(alert.expiredByFirstName, undefined, alert.expiredByLastName),
    }
  }

  public async updateAlert(token: string, bookingId: number, alertId: number, alertChanges: AlertChanges) {
    const prisonApiClient = this.prisonApiClientBuilder(token)
    return prisonApiClient.updateAlert(bookingId, alertId, alertChanges)
  }
}
