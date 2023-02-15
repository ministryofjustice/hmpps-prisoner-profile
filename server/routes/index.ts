import { type RequestHandler, Router } from 'express'
import config from '../config'
import { DisplayBanner, HideBanner } from '../data/pageConfig'
import PrisonApiRestClient from '../data/prisonApiClient'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { Services } from '../services'
import OverviewPageService from '../services/overviewPageService'
import CommonApiRoutes from './common/api'
import { Prisoner } from '../interfaces/prisoner'
import PrisonerSearchClient from '../data/prisonerSearchClient'

import { mapHeaderData } from '../mappers/headerMappers'
import { PageConfig } from '../interfaces/pageConfig'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function routes(service: Services): Router {
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const commonApiRoutes = new CommonApiRoutes()

  const commonRoutes = () => {
    get('/api/prisoner/:prisonerNumber/image', commonApiRoutes.prisonerImage)
  }

  commonRoutes()

  get('/prisoner/:prisonerNumber', async (req, res, next) => {
    const prisonerSearchClient = new PrisonerSearchClient(res.locals.clientToken)
    const prisonerData: Prisoner = await prisonerSearchClient.getPrisonerDetails(req.params.prisonerNumber)

    const prisonApi = new PrisonApiRestClient(res.locals.clientToken)
    const overviewPageService = new OverviewPageService(prisonApi)
    const overviewPageData = await overviewPageService.get(prisonerData)

    const pageConfig: PageConfig = DisplayBanner
    const pageBodyNjk = './overviewPage.njk'

    res.render('pages/index', {
      ...mapHeaderData(prisonerData),
      ...overviewPageData,
      ...pageConfig,
      pageBodyNjk,
    })
  })

  get('/prisoner/:prisonerNumber/image', async (req, res, next) => {
    const prisonerSearchClient = new PrisonerSearchClient(res.locals.clientToken)
    const prisonerData: Prisoner = await prisonerSearchClient.getPrisonerDetails(req.params.prisonerNumber)

    const prisonApi = new PrisonApiRestClient(res.locals.clientToken)
    const overviewPageService = new OverviewPageService(prisonApi)
    const overviewPageData = await overviewPageService.get(prisonerData)

    const pageConfig: PageConfig = DisplayBanner
    const pageBodyNjk = './overviewPage.njk'

    res.render('pages/index', {
      ...mapHeaderData(prisonerData),
      ...overviewPageData,
      ...pageConfig,
      pageBodyNjk,
    })
  })

  get('/', (req, res, next) => {
    res.redirect(config.apis.dpsHomePageUrl)
  })

  return router
}
