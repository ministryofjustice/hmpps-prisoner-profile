import { type RequestHandler, Router } from 'express'
import config from '../config'
import PrisonApiRestClient from '../data/prisonApiClient'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { Services } from '../services'
import OverviewPageService from '../services/overviewPageService'
import CommonApiRoutes from './common/api'
import { Prisoner } from '../interfaces/prisoner'
import PrisonerSearchClient from '../data/prisonerSearchClient'

import { mapHeaderData } from '../mappers/headerMappers'
import AllocationManagerClient from '../data/allocationManagerApiClient'
import KeyWorkersClient from '../data/keyWorkersApiClient'
import PersonalPageService from '../services/personalPageService'

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
    const prisonApiClient = new PrisonApiRestClient(res.locals.clientToken)
    const allocationManagerClient = new AllocationManagerClient(res.locals.clientToken)
    const keyWorkersClient = new KeyWorkersClient(res.locals.clientToken)

    const prisonerData: Prisoner = await prisonerSearchClient.getPrisonerDetails(req.params.prisonerNumber)

    const overviewPageService = new OverviewPageService(prisonApiClient, allocationManagerClient, keyWorkersClient)
    const overviewPageData = await overviewPageService.get(prisonerData)

    res.render('pages/overviewPage', {
      ...mapHeaderData(prisonerData, 'overview'),
      ...overviewPageData,
    })
  })

  get('/prisoner/:prisonerNumber/image', async (req, res, next) => {
    const prisonerSearchClient = new PrisonerSearchClient(res.locals.clientToken)
    const prisonerData: Prisoner = await prisonerSearchClient.getPrisonerDetails(req.params.prisonerNumber)

    res.render('pages/photoPage', {
      ...mapHeaderData(prisonerData),
    })
  })

  get('/prisoner/:prisonerNumber/personal', async (req, res, next) => {
    const prisonerSearchClient = new PrisonerSearchClient(res.locals.clientToken)
    const prisonerData: Prisoner = await prisonerSearchClient.getPrisonerDetails(req.params.prisonerNumber)
    const prisonApiClient = new PrisonApiRestClient(res.locals.clientToken)

    const personalPageService = new PersonalPageService(prisonApiClient)
    const personalPageData = await personalPageService.get()

    res.render('pages/personalPage', {
      ...mapHeaderData(prisonerData, 'personal'),
      ...personalPageData,
    })
  })

  get('/', (req, res, next) => {
    res.redirect(config.apis.dpsHomePageUrl)
  })

  return router
}
