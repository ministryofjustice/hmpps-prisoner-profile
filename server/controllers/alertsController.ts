import { NextFunction, Request, RequestHandler, Response } from 'express'
import { subDays } from 'date-fns'
import { PagedListQueryParams } from '../interfaces/prisonApi/pagedList'
import AlertsPageService from '../services/alertsPageService'
import { mapHeaderData } from '../mappers/headerMappers'
import { Role } from '../data/enums/role'
import { formatLocation, formatName, sortByDateTime, userCanEdit, userHasRoles } from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import { formatDate } from '../utils/dateHelpers'
import { Alert, AlertForm, AlertType } from '../interfaces/prisonApi/alert'
import ReferenceDataService from '../services/referenceDataService'
import { FlashMessageType } from '../data/enums/flashMessageType'
import { AuditService, Page, PostAction, SearchAction } from '../services/auditService'
import logger from '../../logger'

/**
 * Parse request for alerts page and orchestrate response
 */
export default class AlertsController {
  constructor(
    private readonly alertsPageService: AlertsPageService,
    private readonly referenceDataService: ReferenceDataService,
    private readonly auditService: AuditService,
  ) {}

  public async displayAlerts(req: Request, res: Response, next: NextFunction, isActive: boolean) {
    // Get data from middleware
    const { prisonerData, inmateDetail } = req.middleware

    // Parse query params for paging, sorting and filtering data
    const { clientToken } = res.locals
    const queryParams: PagedListQueryParams = {}
    if (req.query.page) queryParams.page = +req.query.page
    if (req.query.sort) queryParams.sort = req.query.sort as string
    if (req.query.alertType) queryParams.alertType = req.query.alertType as string[]
    if (req.query.from) queryParams.from = req.query.from as string
    if (req.query.to) queryParams.to = req.query.to as string
    if (isActive) queryParams.alertStatus = 'ACTIVE'
    if (!isActive) queryParams.alertStatus = 'INACTIVE'
    if (req.query.showAll) queryParams.showAll = Boolean(req.query.showAll)

    // Set role based permissions
    const canUpdateAlert =
      userHasRoles([Role.UpdateAlert], res.locals.user.userRoles) && userCanEdit(res.locals.user, prisonerData)

    let addAlertLinkUrl: string
    if (canUpdateAlert) {
      addAlertLinkUrl = `/prisoner/${prisonerData.prisonerNumber}/add-alert`
    }

    // Get alerts based on given query params
    const alertsPageData = await this.alertsPageService.get(clientToken, prisonerData, queryParams, canUpdateAlert)
    const showingAll = queryParams.showAll

    this.auditService
      .sendSearch({
        userId: res.locals.user.username,
        userCaseLoads: res.locals.user.caseLoads,
        userRoles: res.locals.user.userRoles,
        prisonerNumber: prisonerData.prisonerNumber,
        prisonId: prisonerData.prisonId,
        correlationId: req.id,
        searchPage: SearchAction.Alerts,
        details: { queryParams },
      })
      .catch(error => logger.error(error))

    // Render page
    return res.render('pages/alerts/alertsPage', {
      pageTitle: 'Alerts',
      ...mapHeaderData(prisonerData, inmateDetail, res.locals.user, 'alerts'),
      ...alertsPageData,
      showingAll,
      addAlertLinkUrl,
      activeTab: isActive,
    })
  }

  public async displayAddAlert(req: Request, res: Response, next: NextFunction) {
    const types = await this.referenceDataService.getAlertTypes(res.locals.clientToken)

    // Get data from middleware
    const { firstName, lastName, prisonerNumber, bookingId, alerts, prisonId, cellLocation } =
      req.middleware.prisonerData
    const prisonerBannerName = formatName(firstName, null, lastName, { style: NameFormatStyle.lastCommaFirst })

    const existingAlerts = alerts
      .filter((alert: Alert) => !alert.expired)
      .map((alert: Alert) => alert.alertCode)
      .join(',')

    // Initialise form
    const now = new Date()
    const alertFlash = req.flash('alert')
    const formValues: AlertForm = alertFlash?.length
      ? (alertFlash[0] as never)
      : {
          bookingId,
          existingAlerts,
          alertType: null,
          alertCode: null,
          comment: '',
          alertDate: formatDate(now.toISOString(), 'short'),
        }
    const { alertTypes, alertCodes, typeCodeMap } = this.mapAlertTypes(types, formValues.alertType)
    const errors = req.flash('errors')

    this.auditService
      .sendPageView({
        userId: res.locals.user.username,
        userCaseLoads: res.locals.user.caseLoads,
        userRoles: res.locals.user.userRoles,
        prisonerNumber,
        prisonId,
        correlationId: req.id,
        page: Page.AddAlert,
      })
      .catch(error => logger.error(error))

    return res.render('pages/alerts/addAlert', {
      today: formatDate(now.toISOString(), 'short'),
      todayMinus8: formatDate(subDays(now, 7).toISOString(), 'short'),
      formValues,
      typeCodeMap,
      alertTypes,
      alertCodes,
      refererUrl: `/prisoner/${prisonerNumber}/alerts/active`,
      errors,
      miniBannerData: {
        prisonerName: prisonerBannerName,
        prisonerNumber,
        cellLocation: formatLocation(cellLocation),
      },
    })
  }

  public post(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { prisonerNumber } = req.params
      const { bookingId, existingAlerts, alertType, alertCode, comment, alertDate, expiryDate } = req.body
      const alert = {
        alertType,
        alertCode,
        comment,
        alertDate,
        expiryDate,
      }
      const errors = req.errors || []
      if (!errors.length) {
        try {
          await this.alertsPageService.createAlert(res.locals.user.token, bookingId, alert)
        } catch (error) {
          if (error.status === 400) {
            errors.push({ text: error.message })
          } else throw error
        }
      }

      if (errors.length) {
        req.flash('alert', { ...alert, bookingId, existingAlerts })
        req.flash('errors', errors)
        return res.redirect(`/prisoner/${prisonerNumber}/add-alert`)
      }

      req.flash('flashMessage', { text: 'Alert added', type: FlashMessageType.success })
      this.auditService
        .sendPostSuccess({
          userId: res.locals.user.username,
          userCaseLoads: res.locals.user.caseLoads,
          prisonerNumber,
          correlationId: req.id,
          action: PostAction.Alert,
          details: {},
        })
        .catch(error => logger.error(error))
      return res.redirect(`/prisoner/${prisonerNumber}/alerts/active`)
    }
  }

  public displayAlert(): RequestHandler {
    return async (req: Request, res: Response) => {
      const {
        prisonerData: { bookingId, firstName, lastName, prisonerNumber, cellLocation },
      } = req.middleware
      const { clientToken } = res.locals
      const alertIds = req.query.ids

      const prisonerName = formatName(firstName, null, lastName, { style: NameFormatStyle.lastCommaFirst })

      const alerts: Alert[] = await Promise.all(
        [alertIds].flat().map(alertId => this.alertsPageService.getAlertDetails(clientToken, bookingId, +alertId)),
      )
      // Sort by created date DESC
      alerts.sort((a, b) => sortByDateTime(b.dateCreated, a.dateCreated))

      return res.render('pages/alerts/alertDetailsPage', {
        pageTitle: 'Alerts',
        miniBannerData: {
          prisonerName,
          prisonerNumber,
          cellLocation: formatLocation(cellLocation),
        },
        alerts,
      })
    }
  }

  public getAlertDetails(): RequestHandler {
    return async (req: Request, res: Response) => {
      const {
        prisonerData: { bookingId, prisonerNumber },
      } = req.middleware
      const { clientToken } = res.locals
      const alertIds = req.query.ids

      const alerts: Alert[] = await Promise.all(
        [alertIds].flat().map(alertId => this.alertsPageService.getAlertDetails(clientToken, bookingId, +alertId)),
      )
      // Sort by created date DESC
      alerts.sort((a, b) => sortByDateTime(b.dateCreated, a.dateCreated))

      return res.render('partials/alerts/alertDetails', {
        alerts,
        allAlertsUrl: `/prisoner/${prisonerNumber}/alerts/active`,
      })
    }
  }

  /**
   * Map AlertType array into structures suitable for using in type > code dropdowns.
   *
   * @param types - list of AlertType
   * @param type - preselected alert type to determine list of codes
   */
  private mapAlertTypes(types: AlertType[], type?: string) {
    const alertTypes = types
      ?.filter(t => t.activeFlag === 'Y')
      .map(t => ({ value: t.code, text: t.description }))
      .sort((a, b) => a.text.localeCompare(b.text))

    const typeCodeMap: { [key: string]: { value: string; text: string }[] } = types.reduce(
      (ts, t) => ({
        ...ts,
        [t.code]: t.subCodes
          ?.filter(sc => sc.activeFlag === 'Y')
          .map(s => ({ value: s.code, text: s.description }))
          .sort((a, b) => a.text.localeCompare(b.text)),
      }),
      {},
    )

    let alertCodes: { value: string; text: string }[] = []
    if (type) {
      const selectedType = types.find(t => t.code === type)
      if (selectedType) {
        alertCodes = selectedType.subCodes
          ?.filter(sc => sc.activeFlag === 'Y')
          .map(subType => ({
            value: subType.code,
            text: subType.description,
          }))
          .sort((a, b) => a.text.localeCompare(b.text))
      }
    }
    return { alertTypes, alertCodes, typeCodeMap }
  }
}
