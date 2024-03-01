import { NextFunction, Request, RequestHandler, Response } from 'express'
import { addDays, isToday, subDays } from 'date-fns'
import { PagedListQueryParams } from '../interfaces/prisonApi/pagedList'
import AlertsService from '../services/alertsService'
import { mapHeaderData } from '../mappers/headerMappers'
import { Role } from '../data/enums/role'
import { formatLocation, formatName, sortByDateTime, userCanEdit, userHasRoles } from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import { formatDate, formatDateISO, parseDate } from '../utils/dateHelpers'
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
    private readonly alertsService: AlertsService,
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

    if (isActive && !queryParams.sort) {
      queryParams.sort = 'dateCreated,DESC'
    }

    // Set role based permissions
    const canUpdateAlert =
      userHasRoles([Role.UpdateAlert], res.locals.user.userRoles) && userCanEdit(res.locals.user, prisonerData)

    let addAlertLinkUrl: string
    if (canUpdateAlert) {
      addAlertLinkUrl = `/prisoner/${prisonerData.prisonerNumber}/add-alert`
    }

    // Get alerts based on given query params
    const alertsPageData = await this.alertsService.get(clientToken, prisonerData, queryParams, canUpdateAlert)
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
          await this.alertsService.createAlert(res.locals.user.token, bookingId, alert)
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
        [alertIds].flat().map(alertId => this.alertsService.getAlertDetails(clientToken, bookingId, +alertId)),
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
        [alertIds].flat().map(alertId => this.alertsService.getAlertDetails(clientToken, bookingId, +alertId)),
      )
      // Sort by created date DESC
      alerts.sort((a, b) => sortByDateTime(b.dateCreated, a.dateCreated))

      return res.render('partials/alerts/alertDetails', {
        alerts,
        allAlertsUrl: `/prisoner/${prisonerNumber}/alerts/active`,
      })
    }
  }

  public async displayAddMoreDetails(req: Request, res: Response, next: NextFunction) {
    const { clientToken } = res.locals
    const { alertId } = req.params

    // Get data from middleware
    const { firstName, middleNames, lastName, prisonerNumber, prisonId, cellLocation, bookingId } =
      req.middleware.prisonerData
    const prisonerName = formatName(firstName, middleNames, lastName, { style: NameFormatStyle.firstLast })

    const alert = await this.alertsService.getAlertDetails(clientToken, bookingId, +alertId)

    // If alert already closed, redirect
    if (alert.expired) {
      return res.render('pages/alerts/alreadyClosed', {
        pageTitle: 'Alert already closed',
        refererUrl: `/prisoner/${prisonerNumber}/alerts/active`,
      })
    }

    // Initialise form
    const alertFlash = req.flash('alert')
    const { comment } = alertFlash?.length ? (alertFlash[0] as never) : { comment: alert.comment }
    const formValues = {
      bookingId,
      comment,
    }

    const errors = req.flash('errors') || []

    this.auditService
      .sendPageView({
        userId: res.locals.user.username,
        userCaseLoads: res.locals.user.caseLoads,
        userRoles: res.locals.user.userRoles,
        prisonerNumber,
        prisonId,
        correlationId: req.id,
        page: Page.AlertAddMoreDetails,
      })
      .catch(error => logger.error(error))

    return res.render('pages/alerts/addMoreDetails', {
      pageTitle: 'Add more details to alert',
      miniBannerData: {
        prisonerName,
        prisonerNumber,
        cellLocation: formatLocation(cellLocation),
      },
      alert,
      formValues,
      refererUrl: `/prisoner/${prisonerNumber}/alerts/active`,
      errors,
    })
  }

  public postAddMoreDetails(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { prisonerNumber, alertId } = req.params
      const { bookingId, comment } = req.body

      const errors = req.errors || []
      if (!errors.length) {
        try {
          await this.alertsService.updateAlert(res.locals.user.token, bookingId, +alertId, { comment })
        } catch (error) {
          if (error.status === 400) {
            errors.push({ text: error.message })
          } else throw error
        }
      }

      if (errors.length) {
        req.flash('alert', { comment })
        req.flash('errors', errors)
        return res.redirect(`/prisoner/${prisonerNumber}/alerts/${alertId}/add-more-details`)
      }

      req.flash('flashMessage', { text: 'Alert updated', type: FlashMessageType.success })
      this.auditService
        .sendPostSuccess({
          userId: res.locals.user.username,
          userCaseLoads: res.locals.user.caseLoads,
          prisonerNumber,
          correlationId: req.id,
          action: PostAction.AlertAddMoreDetails,
          details: { comment },
        })
        .catch(error => logger.error(error))
      return res.redirect(`/prisoner/${prisonerNumber}/alerts/active`)
    }
  }

  public async displayCloseAlert(req: Request, res: Response, next: NextFunction) {
    const { clientToken } = res.locals
    const { alertId } = req.params

    // Get data from middleware
    const { firstName, middleNames, lastName, prisonerNumber, prisonId, cellLocation, bookingId } =
      req.middleware.prisonerData
    const prisonerName = formatName(firstName, middleNames, lastName, { style: NameFormatStyle.firstLast })

    const alert = await this.alertsService.getAlertDetails(clientToken, bookingId, +alertId)

    // If alert already closed, redirect
    if (alert.expired) {
      return res.render('pages/alerts/alreadyClosed', {
        pageTitle: 'Alert already closed',
        refererUrl: `/prisoner/${prisonerNumber}/alerts/active`,
      })
    }

    // Initialise form
    const alertFlash = req.flash('alert')
    const { comment, expiryDate, today } = alertFlash?.length
      ? (alertFlash[0] as never)
      : {
          comment: alert.comment,
          expiryDate: formatDate(alert.dateExpires, 'short'),
          today: alert.dateExpires ? 'no' : 'yes',
        }
    const formValues = {
      bookingId,
      comment,
      expiryDate,
      today,
    }

    const errors = req.flash('errors') || []

    this.auditService
      .sendPageView({
        userId: res.locals.user.username,
        userCaseLoads: res.locals.user.caseLoads,
        userRoles: res.locals.user.userRoles,
        prisonerNumber,
        prisonId,
        correlationId: req.id,
        page: Page.AlertClose,
      })
      .catch(error => logger.error(error))

    return res.render('pages/alerts/closeAlert', {
      pageTitle: 'Close alert',
      miniBannerData: {
        prisonerName,
        prisonerNumber,
        cellLocation: formatLocation(cellLocation),
      },
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
      const { bookingId, comment, expiryDate, today } = req.body
      const errors = req.errors || []
      if (!errors.length) {
        try {
          await this.alertsService.updateAlert(res.locals.user.token, bookingId, +alertId, {
            comment,
            expiryDate: today === 'yes' ? formatDateISO(new Date()) : formatDateISO(parseDate(expiryDate)),
          })
        } catch (error) {
          if (error.status === 400) {
            errors.push({ text: error.message })
          } else throw error
        }
      }

      if (errors.length) {
        req.flash('alert', { comment, expiryDate, today })
        req.flash('errors', errors)
        return res.redirect(`/prisoner/${prisonerNumber}/alerts/${alertId}/close`)
      }

      req.flash('flashMessage', {
        text: today === 'yes' ? 'Alert closed' : 'Alert updated',
        type: FlashMessageType.success,
      })
      this.auditService
        .sendPostSuccess({
          userId: res.locals.user.username,
          userCaseLoads: res.locals.user.caseLoads,
          prisonerNumber,
          correlationId: req.id,
          action: PostAction.AlertClose,
          details: { comment, expiryDate },
        })
        .catch(error => logger.error(error))
      return res.redirect(`/prisoner/${prisonerNumber}/alerts/active`)
    }
  }

  public async displayChangeEndDate(req: Request, res: Response, next: NextFunction) {
    const { clientToken } = res.locals
    const { alertId } = req.params

    // Get data from middleware
    const { firstName, middleNames, lastName, prisonerNumber, prisonId, cellLocation, bookingId } =
      req.middleware.prisonerData
    const prisonerName = formatName(firstName, middleNames, lastName, { style: NameFormatStyle.firstLast })

    const alert = await this.alertsService.getAlertDetails(clientToken, bookingId, +alertId)

    // If alert already closed, redirect
    if (alert.expired) {
      return res.render('pages/alerts/alreadyClosed', {
        pageTitle: 'Alert already closed',
        refererUrl: `/prisoner/${prisonerNumber}/alerts/active`,
      })
    }

    // Initialise form
    const alertFlash = req.flash('alert')
    const { comment, expiryDate, removeEndDate } = alertFlash?.length
      ? (alertFlash[0] as never)
      : {
          comment: alert.comment,
          expiryDate: formatDate(alert.dateExpires, 'short'),
          removeEndDate: '',
        }
    const formValues = {
      bookingId,
      comment,
      expiryDate,
      removeEndDate,
    }

    const errors = req.flash('errors') || []

    this.auditService
      .sendPageView({
        userId: res.locals.user.username,
        userCaseLoads: res.locals.user.caseLoads,
        userRoles: res.locals.user.userRoles,
        prisonerNumber,
        prisonId,
        correlationId: req.id,
        page: Page.AlertChangeEndDate,
      })
      .catch(error => logger.error(error))

    return res.render('pages/alerts/changeEndDate', {
      pageTitle: 'Change or remove alert end date',
      miniBannerData: {
        prisonerName,
        prisonerNumber,
        cellLocation: formatLocation(cellLocation),
      },
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
      const { bookingId, comment, expiryDate, removeEndDate } = req.body
      const errors = req.errors || []
      if (!errors.length) {
        try {
          await this.alertsService.updateAlert(res.locals.user.token, bookingId, +alertId, {
            comment,
            expiryDate: removeEndDate === 'yes' ? null : formatDateISO(parseDate(expiryDate)),
          })
        } catch (error) {
          if (error.status === 400) {
            errors.push({ text: error.message })
          } else throw error
        }
      }

      if (errors.length) {
        req.flash('alert', { comment, expiryDate, removeEndDate })
        req.flash('errors', errors)
        return res.redirect(`/prisoner/${prisonerNumber}/alerts/${alertId}/change-end-date`)
      }

      req.flash('flashMessage', {
        text: removeEndDate === 'no' && isToday(parseDate(expiryDate)) ? 'Alert closed' : 'Alert updated',
        type: FlashMessageType.success,
      })
      this.auditService
        .sendPostSuccess({
          userId: res.locals.user.username,
          userCaseLoads: res.locals.user.caseLoads,
          prisonerNumber,
          correlationId: req.id,
          action: PostAction.AlertChangeEndDate,
          details: { comment, expiryDate, removeEndDate },
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
