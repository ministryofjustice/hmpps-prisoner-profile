import { Request, Response } from 'express'
import { PagedListQueryParams } from '../interfaces/prisonApi/pagedList'
import AlertsPageService from '../services/alertsPageService'
import { mapHeaderData } from '../mappers/headerMappers'
import { PrisonerSearchService } from '../services'
import { Role } from '../data/enums/role'
import config from '../config'
import { userCanEdit, userHasRoles } from '../utils/utils'

/**
 * Parse request for alerts page and orchestrate response
 */
export default class AlertsController {
  private isActive: boolean

  constructor(
    isActive: boolean,
    private readonly prisonerSearchService: PrisonerSearchService,
    private readonly alertsPageService: AlertsPageService,
  ) {
    this.isActive = isActive
  }

  public async displayAlerts(req: Request, res: Response) {
    // Parse query params for paging, sorting and filtering data
    const { clientToken } = res.locals
    const queryParams: PagedListQueryParams = {}
    if (req.query.page) queryParams.page = +req.query.page
    if (req.query.sort) queryParams.sort = req.query.sort as string
    if (req.query.alertType) queryParams.alertType = req.query.alertType as string[]
    if (req.query.from) queryParams.from = req.query.from as string
    if (req.query.to) queryParams.to = req.query.to as string
    if (this.isActive) queryParams.alertStatus = 'ACTIVE'
    if (!this.isActive) queryParams.alertStatus = 'INACTIVE'
    if (req.query.showAll) queryParams.showAll = Boolean(req.query.showAll)

    // Get prisoner data for banner and for use in alerts generation
    const prisonerData = await this.prisonerSearchService.getPrisonerDetails(clientToken, req.params.prisonerNumber)

    // Set role based permissions
    const canUpdateAlert =
      userHasRoles([Role.UpdateAlert], res.locals.user.userRoles) && userCanEdit(res.locals.user, prisonerData)

    let addAlertLinkUrl: string
    if (canUpdateAlert) {
      addAlertLinkUrl = `${config.serviceUrls.digitalPrison}/offenders/${prisonerData.prisonerNumber}/create-alert`
    }

    // Get alerts based on given query params
    const alertsPageData = await this.alertsPageService.get(clientToken, prisonerData, queryParams, canUpdateAlert)
    const showingAll = queryParams.showAll

    // Render page
    return res.render('pages/alertsPage', {
      pageTitle: 'Alerts',
      ...mapHeaderData(prisonerData, res.locals.user, 'alerts'),
      ...alertsPageData,
      showingAll,
      addAlertLinkUrl,
      activeTab: this.isActive,
    })
  }
}
