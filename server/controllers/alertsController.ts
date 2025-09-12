import { NextFunction, Request, RequestHandler, Response } from 'express'
import { addDays, isToday, subDays } from 'date-fns'
import { HttpError } from 'http-errors'
import { isGranted, PrisonerAlertsPermission } from '@ministryofjustice/hmpps-prison-permissions-lib'
import AlertsService from '../services/alertsService'
import { mapHeaderData } from '../mappers/headerMappers'
import { sortByDateTime } from '../utils/utils'
import { formatDate, formatDateISO, parseDate } from '../utils/dateHelpers'
import { FlashMessageType } from '../data/enums/flashMessageType'
import { AuditService, Page, PostAction, SearchAction } from '../services/auditService'
import logger from '../../logger'
import { AlertsListQueryParams } from '../data/interfaces/prisonApi/PagedList'
import AlertView from '../services/interfaces/alertsService/AlertView'
import { Alert, AlertCode, AlertForm, AlertType } from '../data/interfaces/alertsApi/Alert'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import getCommonRequestData from '../utils/getCommonRequestData'
import { errorHasStatus } from '../utils/errorHelpers'

// Some alert codes cannot be added or made inactive via the Prisoner Profile:
const excludedAlertCodes: string[] = [
  'DOCGM', // OCG Nominal - Do not share
  'DRONE', // Drone Nominal - Do not share
]

/**
 * Parse request for alerts page and orchestrate response
 */
export default class AlertsController {
  constructor(
    private readonly alertsService: AlertsService,
    private readonly auditService: AuditService,
  ) {}

  public async displayAlerts(req: Request, res: Response, next: NextFunction, isActive: boolean) {
    // Get data from middleware
    const { prisonerData, inmateDetail, alertSummaryData } = req.middleware
    const { user, prisonerPermissions } = res.locals

    if (alertSummaryData.apiUnavailable) {
      // Render banner
      return res.render('pages/alerts/alertsPage', {
        pageTitle: 'Alerts',
        ...mapHeaderData(prisonerData, inmateDetail, alertSummaryData, user, 'alerts'),
      })
    }

    // Parse query params for paging, sorting and filtering data
    const { clientToken } = req.middleware
    const queryParams: AlertsListQueryParams = {}
    if (req.query.page) queryParams.page = +req.query.page
    if (req.query.sort) queryParams.sort = req.query.sort as string
    if (req.query.alertType) queryParams.alertType = req.query.alertType as string[]
    if (req.query.from) queryParams.from = req.query.from as string
    if (req.query.to) queryParams.to = req.query.to as string
    if (isActive) queryParams.alertStatus = 'ACTIVE'
    if (!isActive) queryParams.alertStatus = 'INACTIVE'
    if (req.query.showAll) queryParams.showAll = Boolean(req.query.showAll)

    if (isActive && !queryParams.sort) {
      queryParams.sort = 'dateCreated,DESC'
    }

    const canUpdateAlert = isGranted(PrisonerAlertsPermission.edit, prisonerPermissions)
    const addAlertLinkUrl = canUpdateAlert ? `/prisoner/${prisonerData.prisonerNumber}/add-alert` : undefined

    // Get alerts based on given query params
    const { pagedAlerts, ...alertsPageData } = await this.alertsService.get(
      clientToken,
      prisonerData,
      alertSummaryData,
      queryParams,
    )

    // Insert correct links into alerts
    const alertsList = pagedAlerts?.content.map<AlertView>((alert: Alert) => {
      const alertUpdatable = canUpdateAlert && alert.isActive && !excludedAlertCodes.includes(alert.alertCode.code)
      return {
        ...alert,
        addMoreDetailsLinkUrl: alertUpdatable
          ? `/prisoner/${prisonerData.prisonerNumber}/alerts/${alert.alertUuid}/add-more-details`
          : null,
        closeAlertLinkUrl:
          alertUpdatable && !alert.activeTo
            ? `/prisoner/${prisonerData.prisonerNumber}/alerts/${alert.alertUuid}/close`
            : null,
        changeEndDateLinkUrl:
          alertUpdatable && alert.activeTo
            ? `/prisoner/${prisonerData.prisonerNumber}/alerts/${alert.alertUuid}/change-end-date`
            : null,
      }
    })

    const showingAll = queryParams.showAll

    this.auditService
      .sendSearch({
        user: res.locals.user,
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
      ...mapHeaderData(prisonerData, inmateDetail, alertSummaryData, res.locals.user, 'alerts'),
      ...alertsPageData,
      alertsList,
      showingAll,
      addAlertLinkUrl,
      activeTab: isActive,
    })
  }

  public async displayAddAlert(req: Request, res: Response, next: NextFunction) {
    const { clientToken, alerts, prisonId, prisonerNumber, miniBannerData } = getCommonRequestData(req, res)

    const types = await this.alertsService.getAlertTypes(clientToken)

    const existingAlerts = alerts
      .filter((alert: Prisoner['alerts'][0]) => alert.active)
      .map((alert: Prisoner['alerts'][0]) => alert.alertCode)
      .join(',')

    // Initialise form
    const now = new Date()
    const alertFlash = req.flash('alert')
    const formValues: AlertForm = alertFlash?.length
      ? (alertFlash[0] as unknown as AlertForm)
      : {
          existingAlerts,
          alertType: null,
          alertCode: null,
          description: '',
          activeFrom: formatDate(now.toISOString(), 'short'),
        }
    const { alertTypes, alertCodes, typeCodeMap } = this.mapAlertTypes(types, formValues.alertType, existingAlerts)
    const errors = req.flash('errors')

    this.auditService
      .sendPageView({
        user: res.locals.user,
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
      miniBannerData,
    })
  }

  public post(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { prisonerNumber } = req.params
      const { existingAlerts, alertType, alertCode, description, activeFrom, activeTo } = req.body
      const alertForm = {
        alertType,
        alertCode,
        description,
        activeFrom,
        activeTo,
      }
      const errors = req.errors || []
      if (!errors.length) {
        try {
          await this.alertsService.createAlert(req.middleware.clientToken, {
            prisonerNumber,
            alertForm,
          })
        } catch (error) {
          if (errorHasStatus(error, 400)) {
            errors.push({ text: error.message })
          } else throw error
        }
      }

      if (errors.length) {
        req.flash('alert', { ...alertForm, existingAlerts })
        req.flash('errors', errors)
        return res.redirect(`/prisoner/${prisonerNumber}/add-alert`)
      }

      req.flash('flashMessage', { text: 'Alert added', type: FlashMessageType.success })
      this.auditService
        .sendPostSuccess({
          user: res.locals.user,
          prisonerNumber,
          correlationId: req.id,
          action: PostAction.Alert,
          details: { alertForm },
        })
        .catch(error => logger.error(error))
      return res.redirect(`/prisoner/${prisonerNumber}/alerts/active`)
    }
  }

  public displayAlert(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { clientToken, miniBannerData } = getCommonRequestData(req, res)
      const alertIds = req.query.ids
      const alerts: Alert[] = await Promise.all(
        [alertIds].flat().map(alertId => this.alertsService.getAlertDetails(clientToken, String(alertId))),
      )
      // Sort by created date DESC
      alerts.sort((a, b) => sortByDateTime(b.activeFrom, a.activeFrom))

      return res.render('pages/alerts/alertDetailsPage', {
        pageTitle: 'Alerts',
        miniBannerData,
        alerts,
      })
    }
  }

  public getAlertDetails(): RequestHandler {
    return async (req: Request, res: Response) => {
      const {
        prisonerData: { prisonerNumber },
      } = req.middleware
      const { clientToken } = req.middleware
      const alertIds = req.query.ids

      const alerts: Alert[] = await Promise.all(
        [alertIds].flat().map(alertId => this.alertsService.getAlertDetails(clientToken, String(alertId))),
      )
      // Sort by created date DESC
      alerts.sort((a, b) => sortByDateTime(b.activeFrom, a.activeFrom))

      return res.render('partials/alerts/alertDetails', {
        alerts,
        allAlertsUrl: `/prisoner/${prisonerNumber}/alerts/active`,
      })
    }
  }

  public async displayAddMoreDetails(req: Request, res: Response, next: NextFunction) {
    const { clientToken, prisonerNumber, prisonId, miniBannerData } = getCommonRequestData(req, res)
    const alert = await this.alertsService.getAlertDetails(clientToken, req.params.alertId)

    // If alert already closed, redirect
    if (!alert.isActive) {
      return res.render('pages/alerts/alreadyClosed', {
        pageTitle: 'Alert already closed',
        refererUrl: `/prisoner/${prisonerNumber}/alerts/active`,
      })
    }

    // Initialise form
    const alertFlash = req.flash('alert')
    const { description, activeTo } = alertFlash?.length
      ? (alertFlash[0] as unknown as AlertForm)
      : { description: alert.description, activeTo: alert.activeTo }
    const formValues = {
      description,
      activeTo,
    }

    const errors = req.flash('errors') || []

    this.auditService
      .sendPageView({
        user: res.locals.user,
        prisonerNumber,
        prisonId,
        correlationId: req.id,
        page: Page.AlertAddMoreDetails,
      })
      .catch(error => logger.error(error))

    return res.render('pages/alerts/addMoreDetails', {
      pageTitle: 'Add more details to alert',
      miniBannerData,
      alert,
      formValues,
      refererUrl: `/prisoner/${prisonerNumber}/alerts/active`,
      errors,
    })
  }

  public postAddMoreDetails(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { prisonerNumber, alertId } = req.params
      const { description, activeTo } = req.body

      const errors = req.errors || []
      if (!errors.length) {
        try {
          await this.alertsService.updateAlert(req.middleware.clientToken, alertId, { description, activeTo })
        } catch (error) {
          errors.push(this.handleUpdateErrors(error))
        }
      }

      if (errors.length) {
        req.flash('alert', { description, activeTo })
        req.flash('errors', errors)
        return res.redirect(`/prisoner/${prisonerNumber}/alerts/${alertId}/add-more-details`)
      }

      req.flash('flashMessage', { text: 'Alert updated', type: FlashMessageType.success })
      this.auditService
        .sendPostSuccess({
          user: res.locals.user,
          prisonerNumber,
          correlationId: req.id,
          action: PostAction.AlertAddMoreDetails,
          details: { description },
        })
        .catch(error => logger.error(error))
      return res.redirect(`/prisoner/${prisonerNumber}/alerts/active`)
    }
  }

  public async displayCloseAlert(req: Request, res: Response, next: NextFunction) {
    const { alertId } = req.params
    const { prisonerNumber, prisonId, miniBannerData, clientToken } = getCommonRequestData(req, res)

    const alert = await this.alertsService.getAlertDetails(clientToken, alertId)

    // If alert already closed, redirect
    if (!alert.isActive) {
      return res.render('pages/alerts/alreadyClosed', {
        pageTitle: 'Alert already closed',
        refererUrl: `/prisoner/${prisonerNumber}/alerts/active`,
      })
    }

    // Initialise form
    const alertFlash = req.flash('alert')
    const { description, activeTo, today } = alertFlash?.length
      ? (alertFlash[0] as unknown as AlertForm & { today: string })
      : {
          description: alert.description,
          activeTo: formatDate(alert.activeTo, 'short'),
          today: alert.activeTo ? 'no' : 'yes',
        }
    const formValues = {
      description,
      activeTo,
      today,
    }

    const errors = req.flash('errors') || []

    this.auditService
      .sendPageView({
        user: res.locals.user,
        prisonerNumber,
        prisonId,
        correlationId: req.id,
        page: Page.AlertClose,
      })
      .catch(error => logger.error(error))

    return res.render('pages/alerts/closeAlert', {
      pageTitle: 'Close alert',
      miniBannerData,
      alert,
      formValues,
      tomorrow: formatDate(addDays(new Date(), 1).toISOString(), 'short'),
      refererUrl: `/prisoner/${prisonerNumber}/alerts/active`,
      errors,
    })
  }

  public postCloseAlert(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { prisonerNumber, alertId } = req.params
      const { description, activeTo, today } = req.body
      const errors = req.errors || []
      if (!errors.length) {
        try {
          await this.alertsService.updateAlert(req.middleware.clientToken, alertId, {
            description,
            activeTo: today === 'yes' ? formatDateISO(new Date()) : formatDateISO(parseDate(activeTo)),
          })
        } catch (error) {
          errors.push(this.handleUpdateErrors(error))
        }
      }

      if (errors.length) {
        req.flash('alert', { description, activeTo, today })
        req.flash('errors', errors)
        return res.redirect(`/prisoner/${prisonerNumber}/alerts/${alertId}/close`)
      }

      req.flash('flashMessage', {
        text: today === 'yes' ? 'Alert closed' : 'Alert updated',
        type: FlashMessageType.success,
      })
      this.auditService
        .sendPostSuccess({
          user: res.locals.user,
          prisonerNumber,
          correlationId: req.id,
          action: PostAction.AlertClose,
          details: { description, activeTo },
        })
        .catch(error => logger.error(error))
      return res.redirect(`/prisoner/${prisonerNumber}/alerts/active`)
    }
  }

  public async displayChangeEndDate(req: Request, res: Response, next: NextFunction) {
    const { alertId } = req.params
    const { clientToken, prisonerNumber, prisonId, miniBannerData } = getCommonRequestData(req, res)

    const alert = await this.alertsService.getAlertDetails(clientToken, alertId)

    // If alert already closed, redirect
    if (!alert.isActive) {
      return res.render('pages/alerts/alreadyClosed', {
        pageTitle: 'Alert already closed',
        refererUrl: `/prisoner/${prisonerNumber}/alerts/active`,
      })
    }

    // Initialise form
    const alertFlash = req.flash('alert')
    const { description, activeTo, removeEndDate } = alertFlash?.length
      ? (alertFlash[0] as unknown as AlertForm & { removeEndDate: string })
      : {
          description: alert.description,
          activeTo: formatDate(alert.activeTo, 'short'),
          removeEndDate: '',
        }
    const formValues = {
      description,
      activeTo,
      removeEndDate,
    }

    const errors = req.flash('errors') || []

    this.auditService
      .sendPageView({
        user: res.locals.user,
        prisonerNumber,
        prisonId,
        correlationId: req.id,
        page: Page.AlertChangeEndDate,
      })
      .catch(error => logger.error(error))

    return res.render('pages/alerts/changeEndDate', {
      pageTitle: 'Change or remove alert end date',
      miniBannerData,
      alert,
      formValues,
      today: formatDate(formatDateISO(new Date()), 'short'),
      refererUrl: `/prisoner/${prisonerNumber}/alerts/active`,
      errors,
    })
  }

  public postChangeEndDate(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { prisonerNumber, alertId } = req.params
      const { description, activeTo, removeEndDate } = req.body
      const errors = req.errors || []
      if (!errors.length) {
        try {
          await this.alertsService.updateAlert(req.middleware.clientToken, alertId, {
            description,
            activeTo: removeEndDate === 'yes' ? null : formatDateISO(parseDate(activeTo)),
          })
        } catch (error) {
          errors.push(this.handleUpdateErrors(error))
        }
      }

      if (errors.length) {
        req.flash('alert', { description, activeTo, removeEndDate })
        req.flash('errors', errors)
        return res.redirect(`/prisoner/${prisonerNumber}/alerts/${alertId}/change-end-date`)
      }

      req.flash('flashMessage', {
        text: removeEndDate === 'no' && isToday(parseDate(activeTo)) ? 'Alert closed' : 'Alert updated',
        type: FlashMessageType.success,
      })
      this.auditService
        .sendPostSuccess({
          user: res.locals.user,
          prisonerNumber,
          correlationId: req.id,
          action: PostAction.AlertChangeEndDate,
          details: { description, activeTo, removeEndDate },
        })
        .catch(error => logger.error(error))
      return res.redirect(`/prisoner/${prisonerNumber}/alerts/active`)
    }
  }

  /**
   * Map AlertType array into structures suitable for using in type > code dropdowns.
   *
   * @param types - list of AlertType
   * @param type - preselected alert type to determine list of codes
   * @param existingAlertCodes
   */
  private mapAlertTypes(types: AlertType[], type?: string, existingAlertCodes?: string) {
    const alertTypes = this.mapActiveSortedAlertTypes(types)

    const typeCodeMap: { [key: string]: { value: string; text: string }[] } = types.reduce(
      (ts, t) => ({
        ...ts,
        [t.code]: this.mapActiveSortedAlertTypes(t.alertCodes, existingAlertCodes),
      }),
      {},
    )

    let alertCodes: { value: string; text: string }[] = []
    if (type) {
      const selectedType = types.find(t => t.code === type)
      if (selectedType) {
        alertCodes = this.mapActiveSortedAlertTypes(selectedType.alertCodes, existingAlertCodes)
      }
    }
    return { alertTypes, alertCodes, typeCodeMap }
  }

  private mapActiveSortedAlertTypes(
    alertTypes: (AlertType | AlertCode)[],
    existingAlertCodes?: string,
  ): { text: string; value: string }[] {
    return alertTypes
      ?.filter(alertType => alertType.isActive && !excludedAlertCodes.includes(alertType.code))
      .map(alertType => {
        return {
          value: alertType.code,
          text: alertType.description,
          attributes: existingAlertCodes?.split(',').includes(alertType.code) ? { disabled: 'disabled' } : undefined,
        }
      })
      .sort((a, b) => a.text.localeCompare(b.text))
  }

  private handleUpdateErrors(error: HttpError): { text: string } {
    if (errorHasStatus(error, 400)) {
      return { text: error.message }
    }
    if (errorHasStatus(error, 423)) {
      // Handle alert being locked in NOMIS
      return {
        text: 'This alert cannot be updated because someone else has opened it in NOMIS. Try again later.',
      }
    }
    throw error
  }
}
