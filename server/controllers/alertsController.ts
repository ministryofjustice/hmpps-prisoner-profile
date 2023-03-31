import { Request, Response } from 'express'
import PrisonerSearchClient from '../data/prisonerSearchClient'
import { Prisoner } from '../interfaces/prisoner'
import PrisonApiRestClient from '../data/prisonApiClient'
import { PagedListQueryParams } from '../interfaces/prisonApi/pagedList'
import AlertsPageService from '../services/alertsPageService'
import { mapHeaderData } from '../mappers/headerMappers'

export const alertsController = () => {
  const displayAlerts = async (req: Request, res: Response) => {
    const prisonerSearchClient = new PrisonerSearchClient(res.locals.clientToken)
    const prisonerData: Prisoner = await prisonerSearchClient.getPrisonerDetails(req.params.prisonerNumber)
    const prisonApiClient = new PrisonApiRestClient(res.locals.clientToken)

    // Parse query params for paging, sorting and filtering data
    const queryParams: PagedListQueryParams = {}
    if (req.query.page) queryParams.page = +req.query.page
    if (req.query.sort) queryParams.sort = req.query.sort as string
    if (req.query.alertType) queryParams.alertType = req.query.alertType as string[]
    if (req.query.from) queryParams.from = req.query.from as string
    if (req.query.to) queryParams.to = req.query.to as string
    if (req.path.includes('/active')) queryParams.alertStatus = 'ACTIVE'
    if (req.path.includes('/inactive')) queryParams.alertStatus = 'INACTIVE'

    const alertsPageService = new AlertsPageService(prisonApiClient)
    const alertsPageData = await alertsPageService.get(prisonerData, queryParams)

    return res.render('pages/alertsPage', {
      ...mapHeaderData(prisonerData, 'alerts'),
      ...alertsPageData,
      activeTab: true,
    })
  }

  return { displayAlerts }
}

export default { alertsController }
