import { type RequestHandler, Router } from 'express'
import config from '../config'
import PrisonApiRestClient from '../data/prisonApiClient'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { Services } from '../services'
import CommonApiRoutes from './common/api'
import { Prisoner } from '../interfaces/prisoner'
import PrisonerSearchClient from '../data/prisonerSearchClient'

import { mapHeaderData } from '../mappers/headerMappers'
import CuriousApiClient from '../data/curiousApiClient'
import WorkAndSkillsPageService from '../services/workAndSkillsPageService'
import PersonalPageService from '../services/personalPageService'
import OffencesPageService from '../services/offencesPageService'
import AlertsController from '../controllers/alertsController'
import CaseNotesController from '../controllers/caseNotesController'
import OverviewController from '../controllers/overviewController'

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
    get('/api/image/:imageId', commonApiRoutes.image)
  }

  commonRoutes()

  get('/prisoner/:prisonerNumber', async (req, res, next) => {
    const overviewController = new OverviewController(res.locals.clientToken)
    return overviewController.displayOverview(req, res)
  })

  get('/prisoner/:prisonerNumber/image', async (req, res, next) => {
    const prisonerSearchClient = new PrisonerSearchClient(res.locals.clientToken)
    const prisonerData: Prisoner = await prisonerSearchClient.getPrisonerDetails(req.params.prisonerNumber)

    res.render('pages/photoPage', {
      ...mapHeaderData(prisonerData, res.locals.user),
    })
  })

  get('/prisoner/:prisonerNumber/personal', async (req, res, next) => {
    const prisonerSearchClient = new PrisonerSearchClient(res.locals.clientToken)
    const prisonerData: Prisoner = await prisonerSearchClient.getPrisonerDetails(req.params.prisonerNumber)
    const prisonApiClient = new PrisonApiRestClient(res.locals.clientToken)

    const personalPageService = new PersonalPageService(prisonApiClient)
    const personalPageData = await personalPageService.get(prisonerData)

    res.render('pages/personalPage', {
      pageTitle: 'Personal',
      ...mapHeaderData(prisonerData, res.locals.user, 'personal'),
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

    const fullCourseHistoryLinkUrl = `${config.serviceUrls.digitalPrison}/prisoner/${prisonerData.prisonerNumber}/courses-qualifications`
    const workAndActivities12MonthLinkUrl = `${config.serviceUrls.digitalPrison}/prisoner/${prisonerData.prisonerNumber}/work-activities`
    const workAndActivities7DayLinkUrl = `${config.serviceUrls.digitalPrison}/prisoner/${prisonerData.prisonerNumber}/schedule`

    res.render('pages/workAndSkills', {
      ...mapHeaderData(prisonerData, res.locals.user, 'work-and-skills'),
      ...workAndSkillsPageData,
      pageTitle: 'Work and skills',
      fullCourseHistoryLinkUrl,
      workAndActivities12MonthLinkUrl,
      workAndActivities7DayLinkUrl,
    })
  })

  get('/prisoner/:prisonerNumber/alerts', (req, res, next) => {
    res.redirect(`/prisoner/${req.params.prisonerNumber}/alerts/active`)
  })

  get('/prisoner/:prisonerNumber/alerts/active', async (req, res) => {
    const alertsController = new AlertsController(res.locals.clientToken, true)
    return alertsController.displayAlerts(req, res)
  })

  get('/prisoner/:prisonerNumber/alerts/inactive', async (req, res) => {
    const alertsController = new AlertsController(res.locals.clientToken, false)
    return alertsController.displayAlerts(req, res)
  })

  get('/prisoner/:prisonerNumber/offences', async (req, res, next) => {
    const prisonerSearchClient = new PrisonerSearchClient(res.locals.clientToken)
    const prisonerData: Prisoner = await prisonerSearchClient.getPrisonerDetails(req.params.prisonerNumber)
    const prisonApiClient = new PrisonApiRestClient(res.locals.clientToken)
    const offencesPageService = new OffencesPageService(prisonApiClient)
    const offencesPageData = await offencesPageService.get(prisonerData)

    res.render('pages/offences', {
      pageTitle: 'Offences',
      ...mapHeaderData(prisonerData, res.locals.user, 'offences'),
      ...offencesPageData,
      activeTab: true,
    })
  })

  get('/prisoner/:prisonerNumber/case-notes', async (req, res) => {
    const caseNotesController = new CaseNotesController(res.locals.clientToken, res.locals.user.token)
    return caseNotesController.displayCaseNotes(req, res)
  })

  get('/', (req, res, next) => {
    res.redirect(config.apis.dpsHomePageUrl)
  })

  return router
}
