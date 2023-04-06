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
import CuriousApiClient from '../data/curiousApiClient'
import WorkAndSkillsPageService from '../services/workAndSkillsPageService'
import PersonalPageService from '../services/personalPageService'
import AlertsPageService from '../services/alertsPageService'
import OffencesPageService from '../services/offencesPageService'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function routes(service: Services): Router {
  const router = Router()

  router.use(async (req, res, next) => {
    res.locals = {
      ...res.locals,
      currentUrlPath: req.baseUrl + req.path,
    }
    next()
  })
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
    const personalPageData = await personalPageService.get(prisonerData)

    res.render('pages/personalPage', {
      ...mapHeaderData(prisonerData, 'personal'),
      ...personalPageData,
    })
  })

  get('/prisoner/:prisonerNumber/work-and-skills', async (req, res, next) => {
    const prisonerSearchClient = new PrisonerSearchClient(res.locals.clientToken)
    const prisonerData: Prisoner = await prisonerSearchClient.getPrisonerDetails(req.params.prisonerNumber)

    const curiousApiClient = new CuriousApiClient(res.locals.clientToken)
    const prisonApiClient = new PrisonApiRestClient(res.locals.clientToken)

    const workAndSkillsPageService = new WorkAndSkillsPageService(curiousApiClient, prisonApiClient)
    const workAndSkillsPageData = await workAndSkillsPageService.get(prisonerData)

    res.render('pages/workAndSkills', {
      ...mapHeaderData(prisonerData, 'work-and-skills'),
      ...workAndSkillsPageData,
    })
  })

  get('/prisoner/:prisonerNumber/alerts', (req, res, next) => {
    res.redirect(`/prisoner/${req.params.prisonerNumber}/alerts/active`)
  })

  get('/prisoner/:prisonerNumber/alerts/active', async (req, res, next) => {
    const prisonerSearchClient = new PrisonerSearchClient(res.locals.clientToken)
    const prisonerData: Prisoner = await prisonerSearchClient.getPrisonerDetails(req.params.prisonerNumber)
    const prisonApiClient = new PrisonApiRestClient(res.locals.clientToken)

    // Parse query params for paging, sorting and filtering data
    const queryParams = {
      page: req.query.page ? +req.query.page - 1 : undefined, // Change page to zero based for API query
      sort: req.query.sort ? (req.query.sort as string) : undefined,
    }
    const alertsPageService = new AlertsPageService(prisonApiClient)
    const alertsPageData = await alertsPageService.get(prisonerData, {
      ...queryParams,
      alertStatus: 'ACTIVE',
    })

    res.render('pages/alertsPage', {
      ...mapHeaderData(prisonerData, 'alerts'),
      ...alertsPageData,
      activeTab: true,
    })
  })

  get('/prisoner/:prisonerNumber/alerts/inactive', async (req, res, next) => {
    const prisonerSearchClient = new PrisonerSearchClient(res.locals.clientToken)
    const prisonerData: Prisoner = await prisonerSearchClient.getPrisonerDetails(req.params.prisonerNumber)
    const prisonApiClient = new PrisonApiRestClient(res.locals.clientToken)

    // Parse query params for paging, sorting and filtering data
    const queryParams = {
      page: req.query.page ? +req.query.page - 1 : undefined, // Change page to zero based for API query
      sort: req.query.sort ? (req.query.sort as string) : undefined,
    }
    const alertsPageService = new AlertsPageService(prisonApiClient)
    const alertsPageData = await alertsPageService.get(prisonerData, {
      ...queryParams,
      alertStatus: 'INACTIVE',
    })

    res.render('pages/alertsPage', {
      ...mapHeaderData(prisonerData, 'alerts'),
      ...alertsPageData,
      activeTab: false,
    })
  })

  get('/prisoner/:prisonerNumber/offences', async (req, res, next) => {
    const prisonerSearchClient = new PrisonerSearchClient(res.locals.clientToken)
    const prisonerData: Prisoner = await prisonerSearchClient.getPrisonerDetails(req.params.prisonerNumber)
    const prisonApiClient = new PrisonApiRestClient(res.locals.clientToken)
    const offencesPageService = new OffencesPageService(prisonApiClient)
    const offencesPageData = await offencesPageService.get(prisonerData)

    console.log(offencesPageData.courtCaseData)

    res.render('pages/offences', {
      ...mapHeaderData(prisonerData, 'offences'),
      ...offencesPageData,
      activeTab: true,
    })
  })

  get('/', (req, res, next) => {
    res.redirect(config.apis.dpsHomePageUrl)
  })

  return router
}
