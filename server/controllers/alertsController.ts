import { Request, Response } from 'express'
import { PagedListQueryParams } from '../interfaces/prisonApi/pagedList'
import AlertsPageService from '../services/alertsPageService'
import { mapHeaderData } from '../mappers/headerMappers'
import { PrisonerSearchService } from '../services'
import { Role } from '../data/enums/role'
import { canViewOrAddCaseNotes } from '../utils/roleHelpers'

/**
 * Parse request for alerts page and orchestrate response
 */
export default class AlertsController {
  private prisonerSearchService: PrisonerSearchService

  private alertsPageService: AlertsPageService

  private isActive: boolean

  constructor(clientToken: string, isActive: boolean) {
    this.prisonerSearchService = new PrisonerSearchService(clientToken)
    this.alertsPageService = new AlertsPageService(clientToken)
    this.isActive = isActive
  }

  public async displayAlerts(req: Request, res: Response) {
    // Parse query params for paging, sorting and filtering data
    const queryParams: PagedListQueryParams = {}
    if (req.query.page) queryParams.page = +req.query.page
    if (req.query.sort) queryParams.sort = req.query.sort as string
    if (req.query.alertType) queryParams.alertType = req.query.alertType as string[]
    if (req.query.from) queryParams.from = req.query.from as string
    if (req.query.to) queryParams.to = req.query.to as string
    if (this.isActive) queryParams.alertStatus = 'ACTIVE'
    if (!this.isActive) queryParams.alertStatus = 'INACTIVE'

    // Get prisoner data for banner and for use in alerts generation
    const prisonerData = await this.prisonerSearchService.getPrisonerDetails(req.params.prisonerNumber)

    // Set role based permissions
    const canUpdateAlert =
      res.locals.user.userRoles?.some((role: string) => role === Role.UpdateAlert) &&
      (res.locals.user.activeCaseLoadId === prisonerData.prisonId || ['OUT', 'TRN'].includes(prisonerData.prisonId))

    // Get alerts based on given query params
    const alertsPageData = await this.alertsPageService.get(prisonerData, queryParams, canUpdateAlert)

    // Render page
    return res.render('pages/alertsPage', {
      pageTitle: 'Alerts',
      ...mapHeaderData(
        prisonerData,
        canViewOrAddCaseNotes(res.locals.user.userRoles, res.locals.user.activeCaseLoadId, prisonerData.prisonId),
        'alerts',
      ),
      ...alertsPageData,
      activeTab: this.isActive,
    })
  }
}
