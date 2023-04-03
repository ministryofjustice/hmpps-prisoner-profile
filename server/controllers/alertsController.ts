import { Request, Response } from 'express'
import { PagedListQueryParams } from '../interfaces/prisonApi/pagedList'
import AlertsPageService from '../services/alertsPageService'
import { mapHeaderData } from '../mappers/headerMappers'
import { PrisonerSearchService } from '../services'

/**
 * Parse request for alerts page and orchestrate response
 */
export default class AlertsController {
  private prisonerSearchService: PrisonerSearchService

  private alertsPageService: AlertsPageService

  constructor(clientToken: string) {
    this.prisonerSearchService = new PrisonerSearchService(clientToken)
    this.alertsPageService = new AlertsPageService(clientToken)
  }

  public async displayAlerts(req: Request, res: Response) {
    // Parse query params for paging, sorting and filtering data
    const queryParams: PagedListQueryParams = {}
    if (req.query.page) queryParams.page = +req.query.page
    if (req.query.sort) queryParams.sort = req.query.sort as string
    if (req.query.alertType) queryParams.alertType = req.query.alertType as string[]
    if (req.query.from) queryParams.from = req.query.from as string
    if (req.query.to) queryParams.to = req.query.to as string
    if (req.path.includes('/active')) queryParams.alertStatus = 'ACTIVE'
    if (req.path.includes('/inactive')) queryParams.alertStatus = 'INACTIVE'

    // Get prisoner data for banner and for use in alerts generation
    const prisonerData = await this.prisonerSearchService.getPrisonerDetails(req.params.prisonerNumber)

    // Get alerts based on given query params
    const alertsPageData = await this.alertsPageService.get(prisonerData, queryParams)

    // Render page
    return res.render('pages/alertsPage', {
      ...mapHeaderData(prisonerData, 'alerts'),
      ...alertsPageData,
      activeTab: true,
    })
  }
}
