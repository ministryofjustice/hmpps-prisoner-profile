import { isBefore, isFuture } from 'date-fns'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import AlertsPageData from './interfaces/alertsService/AlertsPageData'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import { formatName, generateListMetadata } from '../utils/utils'
import { SortOption } from '../interfaces/SortParams'
import AlertTypeFilter from './interfaces/alertsService/AlertsMetadata'
import { formatDateISO, isRealDate, parseDate } from '../utils/dateHelpers'
import HmppsError from '../interfaces/HmppsError'
import { AlertForm } from '../data/interfaces/prisonApi/PrisonApiAlert'
import { RestClientBuilder } from '../data'
import PagedList, { AlertsListQueryParams } from '../data/interfaces/prisonApi/PagedList'
import {
  capitaliseAlertDisplayNames,
  toAlert,
  toAlertsApiCreateAlert,
  toAlertType,
  toPrisonAlertChanges,
  toPrisonApiCreateAlert,
} from './mappers/alertMapper'
import { Alert, AlertChanges } from '../data/interfaces/alertsApi/Alert'
import { AlertsApiClient } from '../data/interfaces/alertsApi/alertsApiClient'
import FeatureToggleService from './featureToggleService'

export default class AlertsService {
  constructor(
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly alertsApiClientBuilder: RestClientBuilder<AlertsApiClient>,
    private readonly featureToggleService: FeatureToggleService,
  ) {}

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
   * Map query params from the browser to values suitable for sending to the Prison API.
   *
   * @param queryParams
   * @private
   */
  private mapToPrisonApiParams(queryParams: AlertsListQueryParams) {
    return {
      ...queryParams,
      ...(queryParams.from && { from: formatDateISO(parseDate(queryParams.from)) }),
      ...(queryParams.to && { to: formatDateISO(parseDate(queryParams.to)) }),
      ...(queryParams.page && { page: Number(queryParams.page) - 1 }), // Change page to zero based for API query
      size: queryParams.showAll ? 9999 : 20,
    }
  }

  /**
   * Map query params from the browser to values suitable for sending to the Alerts API.
   *
   * @param queryParams
   * @private
   */
  private mapToAlertsApiParams(queryParams: AlertsListQueryParams) {
    return {
      ...(queryParams.alertType && { alertType: queryParams.alertType }),
      ...(queryParams.from && { activeFromStart: formatDateISO(parseDate(queryParams.from)) }),
      ...(queryParams.to && { activeFromEnd: formatDateISO(parseDate(queryParams.to)) }),
      ...(queryParams.sort && {
        sort: queryParams.sort.replace('dateCreated', 'activeFrom').replace('dateExpires', 'activeTo'),
      }),
      ...(queryParams.page && { page: Number(queryParams.page) - 1 }), // Change page to zero based for API query
      isActive: queryParams.alertStatus === 'ACTIVE',
      size: queryParams?.showAll ? 9999 : 20,
    }
  }

  /**
   * Handle request for alerts
   *
   * @param clientToken
   * @param prisonerData
   * @param queryParams
   */
  public async get(
    clientToken: string,
    prisonId: string,
    prisonerData: Prisoner,
    queryParams: AlertsListQueryParams,
  ): Promise<AlertsPageData> {
    const isActiveAlertsQuery = queryParams?.alertStatus === 'ACTIVE'
    const prisonApiClient = this.prisonApiClientBuilder(clientToken)
    const alertsApiClient = this.alertsApiClientBuilder(clientToken)
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
        ? await this.getPagedAlerts(prisonId, prisonApiClient, alertsApiClient, prisonerData, queryParams)
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
    prisonId: string,
    prisonApiClient: PrisonApiClient,
    alertsApiClient: AlertsApiClient,
    prisonerData: Prisoner,
    queryParams: AlertsListQueryParams,
  ): Promise<PagedList<Alert> | null> {
    const alertsApiEnabled = await this.featureToggleService.getFeatureToggle(prisonId, 'alertsApiEnabled')

    if (alertsApiEnabled) {
      const pagedAlerts = await alertsApiClient.getAlerts(
        prisonerData.prisonerNumber,
        this.mapToAlertsApiParams(queryParams),
      )
      return {
        ...pagedAlerts,
        content: pagedAlerts.content.map(capitaliseAlertDisplayNames),
      }
    }

    const pagedAlerts = await prisonApiClient.getAlerts(prisonerData.bookingId, this.mapToPrisonApiParams(queryParams))
    return {
      ...pagedAlerts,
      content: pagedAlerts.content.map(toAlert),
    }
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  public async createAlert(
    token: string,
    {
      prisonId,
      bookingId,
      prisonerNumber,
      alertForm,
    }: { prisonId: string; bookingId: number; prisonerNumber: string; alertForm: AlertForm },
  ) {
    const alertsApiEnabled = await this.featureToggleService.getFeatureToggle(prisonId, 'alertsApiEnabled')

    if (alertsApiEnabled) {
      const alertsApiClient = this.alertsApiClientBuilder(token)
      const alert = await alertsApiClient.createAlert(toAlertsApiCreateAlert(alertForm, prisonerNumber))

      return capitaliseAlertDisplayNames(alert)
    }

    const prisonApiClient = this.prisonApiClientBuilder(token)
    const alert = await prisonApiClient.createAlert(bookingId, toPrisonApiCreateAlert(alertForm))

    return toAlert(alert)
  }

  public async getAlertDetails(token: string, prisonId: string, bookingId: number, alertId: string) {
    const alertsApiEnabled = await this.featureToggleService.getFeatureToggle(prisonId, 'alertsApiEnabled')

    if (alertsApiEnabled) {
      const alertsApiClient = this.alertsApiClientBuilder(token)
      const alert = await alertsApiClient.getAlertDetails(alertId)

      return capitaliseAlertDisplayNames(alert)
    }

    const prisonApiClient = this.prisonApiClientBuilder(token)
    const alert = await prisonApiClient.getAlertDetails(bookingId, alertId)

    return {
      ...toAlert(alert),
    }
  }

  public async updateAlert(
    token: string,
    prisonId: string,
    bookingId: number,
    alertId: string,
    alertChanges: AlertChanges,
  ) {
    const alertsApiEnabled = await this.featureToggleService.getFeatureToggle(prisonId, 'alertsApiEnabled')

    if (alertsApiEnabled) {
      const alertsApiClient = this.alertsApiClientBuilder(token)
      const alert = await alertsApiClient.updateAlert(alertId, alertChanges)

      return capitaliseAlertDisplayNames(alert)
    }

    const prisonApiClient = this.prisonApiClientBuilder(token)
    const prisonApiAlert = await prisonApiClient.updateAlert(bookingId, alertId, toPrisonAlertChanges(alertChanges))

    return toAlert(prisonApiAlert)
  }

  public async getAlertTypes(token: string, prisonId: string) {
    const alertsApiEnabled = await this.featureToggleService.getFeatureToggle(prisonId, 'alertsApiEnabled')

    if (alertsApiEnabled) {
      const alertsApiClient = this.alertsApiClientBuilder(token)
      const alertTypes = await alertsApiClient.getAlertTypes()

      return alertTypes.filter(alertType => alertType.alertCodes?.length) // Exclude alert types with no alert codes as they cannot be selected
    }

    const prisonApiClient = this.prisonApiClientBuilder(token)
    const alertTypes = await prisonApiClient.getAlertTypes()

    return alertTypes.map(toAlertType)
  }
}
