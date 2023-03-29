import { type RequestHandler, Router } from 'express'
import { formatISO, parse } from 'date-fns'
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
import { PagedListQueryParams } from '../interfaces/prisonApi/pagedList'
import { AlertsPageData } from '../interfaces/pages/alertsPageData'

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
    const errors = []

    // Parse query params for paging, sorting and filtering data
    const queryParams: PagedListQueryParams = {}
    if (req.query.page) queryParams.page = +req.query.page - 1 // Change page to zero based for API query
    if (req.query.sort) queryParams.sort = req.query.sort as string
    if (req.query.alertType) queryParams.alertType = req.query.alertType as string[]
    if (req.query.from) queryParams.from = req.query.from as string
    if (req.query.to) queryParams.to = req.query.to as string

    // Parse filter dates into ISO-8601 format (date only)
    const dateFormatPattern = /(\d{1,2})[-/,. ](\d{1,2})[-/,. ](\d{4})/
    if (queryParams.from) {
      try {
        if (dateFormatPattern.test(queryParams.from)) {
          queryParams.from = formatISO(parse(queryParams.from, 'dd/MM/yyyy', new Date()), {
            representation: 'date',
          })
        } else {
          errors.push({ text: 'Date from must be a real date', href: '#from' })
        }
      } catch (error) {
        errors.push({ text: `Date from must be a real date`, href: '#from' })
      }
    }
    if (queryParams.to) {
      try {
        if (dateFormatPattern.test(queryParams.from)) {
          queryParams.to = formatISO(parse(queryParams.to, 'dd/MM/yyyy', new Date()), { representation: 'date' })
        } else {
          errors.push({ text: 'Date to must be a real date', href: '#to' })
        }
      } catch (error) {
        errors.push({ text: `Date to must be a real date`, href: '#to' })
      }
    }

    let alertsPageData: AlertsPageData = {} as AlertsPageData
    if (errors.length) {
      ;(req as any).flash('errors', errors)
      return res.redirect(`/prisoner/${req.params.prisonerNumber}/alerts/active`)
    }

    const alertsPageService = new AlertsPageService(prisonApiClient)
    alertsPageData = await alertsPageService.get(prisonerData, {
      ...queryParams,
      alertStatus: 'ACTIVE',
    })

    return res.render('pages/alertsPage', {
      ...mapHeaderData(prisonerData, 'alerts'),
      ...alertsPageData,
      errors: [...req.flash('errors')],
      activeTab: true,
    })
  })

  get('/prisoner/:prisonerNumber/alerts/inactive', async (req, res, next) => {
    const prisonerSearchClient = new PrisonerSearchClient(res.locals.clientToken)
    const prisonerData: Prisoner = await prisonerSearchClient.getPrisonerDetails(req.params.prisonerNumber)
    const prisonApiClient = new PrisonApiRestClient(res.locals.clientToken)

    // Parse query params for paging, sorting and filtering data
    const queryParams: PagedListQueryParams = {}
    if (req.query.page) queryParams.page = +req.query.page - 1 // Change page to zero based for API query
    if (req.query.sort) queryParams.sort = req.query.sort as string
    if (req.query.alertType) queryParams.alertType = req.query.alertType as string[]
    if (req.query.from) queryParams.from = req.query.from as string
    if (req.query.to) queryParams.to = req.query.to as string

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

  get('/', (req, res, next) => {
    res.redirect(config.apis.dpsHomePageUrl)
  })

  return router
}
