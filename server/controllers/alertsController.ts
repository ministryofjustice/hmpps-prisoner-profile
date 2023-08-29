import { NextFunction, Request, RequestHandler, Response } from 'express'
import { subDays } from 'date-fns'
import { PagedListQueryParams } from '../interfaces/prisonApi/pagedList'
import AlertsPageService from '../services/alertsPageService'
import { mapHeaderData } from '../mappers/headerMappers'
import { Role } from '../data/enums/role'
import config from '../config'
import { formatName, userCanEdit, userHasRoles } from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import { formatDate } from '../utils/dateHelpers'
import { AlertForm, AlertType } from '../interfaces/prisonApi/alert'
import ReferenceDataService from '../services/referenceDataService'
import { FlashMessageType } from '../data/enums/flashMessageType'
import { Alert } from '../interfaces/prisoner'

/**
 * Parse request for alerts page and orchestrate response
 */
export default class AlertsController {
  constructor(
    private readonly alertsPageService: AlertsPageService,
    private readonly referenceDataService: ReferenceDataService,
  ) {}

  public displayAlerts(isActive: boolean): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
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
  }

  public displayAddAlert(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const types = await this.referenceDataService.getAlertTypes(res.locals.clientToken)

      // Get data from middleware
      const { firstName, lastName, prisonerNumber, bookingId, alerts } = req.middleware.prisonerData
      const prisonerDisplayName = formatName(firstName, undefined, lastName, { style: NameFormatStyle.firstLast })

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

      return res.render('pages/alerts/addAlert', {
        today: formatDate(now.toISOString(), 'short'),
        todayMinus8: formatDate(subDays(now, 8).toISOString(), 'short'),
        prisonerDisplayName,
        prisonerNumber,
        formValues,
        typeCodeMap,
        alertTypes,
        alertCodes,
        refererUrl: `/prisoner/${prisonerNumber}/alerts/active`,
        errors,
      })
    }
  }

  public post(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { prisonerNumber } = req.params
      const { bookingId, existingAlerts, alertType, alertCode, comment, alertDate } = req.body
      const alert = {
        alertType,
        alertCode,
        comment,
        alertDate,
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
    const alertTypes = types?.filter(t => t.activeFlag).map(t => ({ value: t.code, text: t.description }))

    const typeCodeMap: { [key: string]: { value: string; text: string }[] } = types.reduce(
      (ts, t) => ({
        ...ts,
        [t.code]: t.subCodes?.map(s => ({ value: s.code, text: s.description })),
      }),
      {},
    )

    let alertCodes: { value: string; text: string }[] = []
    if (type) {
      const selectedType = types.find(t => t.code === type)
      if (selectedType) {
        alertCodes = selectedType.subCodes
          ?.filter(t => t.activeFlag)
          .map(subType => ({
            value: subType.code,
            text: subType.description,
          }))
      }
    }

    return { alertTypes, alertCodes, typeCodeMap }
  }
}
