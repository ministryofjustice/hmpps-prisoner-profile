import { type RequestHandler, Router } from 'express'
import config from '../config'
import PrisonApiRestClient from '../data/prisonApiClient'
import { OverviewPage } from '../interfaces/overviewPage'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { PageService, Services } from '../services'
import OverviewPageService from '../services/overviewPageService'
import CommonApiRoutes from './common/api'

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
    const pageService = new PageService()
    const prisonApi = new PrisonApiRestClient(res.locals.user.token)
    const overviewPageService = new OverviewPageService(prisonApi)
    const overviewPage = await overviewPageService.get(req.params.prisonerNumber)
    pageService.renderPage<OverviewPage>(res, req.params.prisonerNumber, 'pages/index', overviewPage)
  })

  get('/', (req, res, next) => {
    res.redirect(config.apis.dpsHomePageUrl)
  })

  return router
}
