import { Router } from 'express'
import type HeaderFooterMeta from '@ministryofjustice/hmpps-connect-dps-components/dist/types/HeaderFooterMeta'
import config from '../config'
import { mapHeaderData } from '../mappers/headerMappers'
import OverviewController from '../controllers/overviewController'
import { userHasRoles } from '../utils/utils'
import { Role } from '../data/enums/role'
import { saveBackLink } from '../controllers/backLinkController'
import { Services } from '../services'
import caseNotesRouter from './caseNotesRouter'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import alertsRouter from './alertsRouter'
import PrisonerScheduleController from '../controllers/prisonerScheduleController'
import csraRouter from './csraRouter'
import moneyRouter from './moneyRouter'
import appointmentRouter from './appointmentRouter'
import PrisonerLocationHistoryController from '../controllers/prisonerLocationHistoryController'
import professionalContactsRouter from './professionalContactsRouter'
import goalsRouter from './goalsRouter'
import { ApiAction, Page } from '../services/auditService'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import BeliefHistoryController from '../controllers/beliefHistoryController'
import locationDetailsRouter from './locationDetailsRouter'
import { getRequest } from './routerUtils'
import probationDocumentsRouter from './probationDocumentsRouter'
import visitsRouter from './visitsRouter'
import addressRouter from './addressRouter'
import retrieveCuriousInPrisonCourses from '../middleware/retrieveCuriousInPrisonCourses'
import CareNeedsController from '../controllers/careNeedsController'
import permissionsGuard from '../middleware/permissionsGuard'
import personalRouter from './personalRouter'

export const standardGetPaths = /^(?!\/api|\/save-backlink|^\/$).*/

export default function routes(services: Services): Router {
  const router = Router()
  const get = getRequest(router)
  const basePath = '/prisoner/:prisonerNumber([a-zA-Z][0-9]{4}[a-zA-Z]{2})'

  router.use(async (req, res, next) => {
    res.locals = {
      ...res.locals,
      currentUrlPath: req.baseUrl + req.path,
    }
    next()
  })

  router.get(standardGetPaths, async (_req, res, next) => {
    /* Set feature toggle for using Alerts API */
    const feComponentsMeta = res.locals.feComponentsMeta as HeaderFooterMeta
    if (!feComponentsMeta?.services || !('activeCaseLoadId' in res.locals.user)) return next()

    try {
      await services.featureToggleService.setFeatureToggle(
        res.locals.user.activeCaseLoadId,
        'alertsApiEnabled',
        feComponentsMeta.services.some(service => service.id === 'alerts'),
      )
      return next()
    } catch (_error) {
      return next()
    }
  })

  const overviewController = new OverviewController(
    services.dataAccess.pathfinderApiClientBuilder,
    services.dataAccess.manageSocCasesApiClientBuilder,
    services.auditService,
    services.offencesService,
    services.moneyService,
    services.adjudicationsService,
    services.visitsService,
    services.prisonerScheduleService,
    services.incentivesService,
    services.personalPageService,
    services.offenderService,
    services.professionalContactsService,
  )

  const prisonerScheduleController = new PrisonerScheduleController(
    services.dataAccess.prisonApiClientBuilder,
    services.auditService,
  )
  const beliefHistoryController = new BeliefHistoryController(services.beliefService, services.auditService)
  const careNeedsController = new CareNeedsController(services.careNeedsService, services.auditService)

  get(
    `/api${basePath}/image`,
    auditPageAccessAttempt({ services, page: ApiAction.PrisonerImage }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getOverviewPermissions),
    services.commonApiRoutes.prisonerImage,
  )

  get(
    '/api/image/:imageId',
    auditPageAccessAttempt({ services, page: ApiAction.Image }),
    services.commonApiRoutes.image,
  )

  get(
    `${basePath}`,
    auditPageAccessAttempt({ services, page: Page.Overview }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getOverviewPermissions),
    async (req, res, next) => {
      return overviewController.displayOverview(req, res)
    },
  )

  get(
    `${basePath}/image`,
    auditPageAccessAttempt({ services, page: Page.Photo }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getOverviewPermissions),
    async (req, res, next) => {
      const prisonerData = req.middleware?.prisonerData
      const inmateDetail = req.middleware?.inmateDetail
      const alertFlags = req.middleware?.alertSummaryData.alertFlags

      await services.auditService.sendPageView({
        user: res.locals.user,
        prisonerNumber: prisonerData.prisonerNumber,
        prisonId: prisonerData.prisonId,
        correlationId: req.id,
        page: Page.Photo,
      })

      res.render('pages/photoPage', {
        pageTitle: `Picture of ${prisonerData.prisonerNumber}`,
        ...mapHeaderData(prisonerData, inmateDetail, alertFlags, res.locals.user),
      })
    },
  )

  get(
    `${basePath}/work-and-skills`,
    auditPageAccessAttempt({ services, page: Page.WorkAndSkills }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getOverviewPermissions),
    retrieveCuriousInPrisonCourses(services.curiousService),
    async (req, res, next) => {
      const prisonerData = req.middleware?.prisonerData
      const inmateDetail = req.middleware?.inmateDetail
      const alertFlags = req.middleware?.alertSummaryData.alertFlags
      const { workAndSkillsPageService } = services
      const workAndSkillsPageData = await workAndSkillsPageService.get(req.middleware.clientToken, prisonerData)

      const fullCourseHistoryLinkUrl = `${config.serviceUrls.learningAndWorkProgress}/prisoner/${prisonerData.prisonerNumber}/work-and-skills/in-prison-courses-and-qualifications`
      const workAndActivities12MonthLinkUrl = `${config.serviceUrls.digitalPrison}/prisoner/${prisonerData.prisonerNumber}/work-activities`
      const workAndActivities7DayLinkUrl = `/prisoner/${prisonerData.prisonerNumber}/schedule`
      const vc2goalsUrl = `/prisoner/${prisonerData.prisonerNumber}/vc2-goals`
      const canEditEducationWorkPlan = userHasRoles([Role.EditEducationWorkPlan], res.locals.user.userRoles)

      const hasVc2Goals =
        workAndSkillsPageData.curiousGoals.employmentGoals?.length > 0 ||
        workAndSkillsPageData.curiousGoals.personalGoals?.length > 0 ||
        workAndSkillsPageData.curiousGoals.shortTermGoals?.length > 0 ||
        workAndSkillsPageData.curiousGoals.longTermGoals?.length > 0

      const hasPlpGoals = workAndSkillsPageData.personalLearningPlanActionPlan?.goals?.length > 0

      const problemRetrievingPrisonerGoalData =
        workAndSkillsPageData.curiousGoals.problemRetrievingData ||
        workAndSkillsPageData.personalLearningPlanActionPlan?.problemRetrievingData

      await services.auditService.sendPageView({
        user: res.locals.user,
        prisonerNumber: prisonerData.prisonerNumber,
        prisonId: prisonerData.prisonId,
        correlationId: req.id,
        page: Page.WorkAndSkills,
      })

      res.render('pages/workAndSkills', {
        ...mapHeaderData(prisonerData, inmateDetail, alertFlags, res.locals.user, 'work-and-skills'),
        ...workAndSkillsPageData,
        pageTitle: 'Work and skills',
        fullCourseHistoryLinkUrl,
        workAndActivities12MonthLinkUrl,
        workAndActivities7DayLinkUrl,
        vc2goalsUrl,
        canEditEducationWorkPlan,
        hasVc2Goals,
        hasPlpGoals,
        problemRetrievingPrisonerGoalData,
      })
    },
  )

  get(
    `${basePath}/offences`,
    auditPageAccessAttempt({ services, page: Page.Offences }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getOverviewPermissions),
    async (req, res, next) => {
      const prisonerData = req.middleware?.prisonerData
      const inmateDetail = req.middleware?.inmateDetail
      const alertFlags = req.middleware?.alertSummaryData.alertFlags
      const { offencesPageService } = services
      const { courtCaseData, releaseDates } = await offencesPageService.get(req.middleware.clientToken, prisonerData)

      await services.auditService.sendPageView({
        user: res.locals.user,
        prisonerNumber: prisonerData.prisonerNumber,
        prisonId: prisonerData.prisonId,
        correlationId: req.id,
        page: Page.Offences,
      })

      res.render('pages/offences', {
        pageTitle: 'Offences',
        ...mapHeaderData(prisonerData, inmateDetail, alertFlags, res.locals.user, 'offences'),
        courtCaseData,
        releaseDates,
        activeTab: true,
      })
    },
  )

  router.use(caseNotesRouter(services))
  router.use(alertsRouter(services))
  router.use(csraRouter(services))
  router.use(appointmentRouter(services))
  router.use(professionalContactsRouter(services))
  router.use(goalsRouter(services))
  router.use(locationDetailsRouter(services))
  router.use(probationDocumentsRouter(services))
  router.use(visitsRouter(services))
  router.use(addressRouter(services))
  router.use(personalRouter(services))

  get(
    `${basePath}/schedule`,
    auditPageAccessAttempt({ services, page: Page.Schedule }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getOverviewPermissions),
    async (req, res, next) => {
      const prisonerData = req.middleware?.prisonerData
      return prisonerScheduleController.displayPrisonerSchedule(req, res, prisonerData)
    },
  )

  get(
    `${basePath}/x-ray-body-scans`,
    auditPageAccessAttempt({ services, page: Page.XRayBodyScans }),
    getPrisonerData(services, { minimal: true }),
    permissionsGuard(services.permissionsService.getOverviewPermissions),
    async (req, res, next) => {
      return careNeedsController.displayXrayBodyScans(req, res)
    },
  )

  get(
    `${basePath}/location-history`,
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getOverviewPermissions),
    async (req, res, next) => {
      const prisonerData = req.middleware?.prisonerData
      const prisonerLocationHistoryController = new PrisonerLocationHistoryController(
        services.prisonerLocationHistoryService,
      )
      return prisonerLocationHistoryController.displayPrisonerLocationHistory(req, res, prisonerData)
    },
  )

  router.use(
    `${basePath}/money`,
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getMoneyPermissions),
    moneyRouter(services),
  )

  get(
    `${basePath}/religion-belief-history`,
    auditPageAccessAttempt({ services, page: Page.ReligionBeliefHistory }),
    getPrisonerData(services, { minimal: true }),
    permissionsGuard(services.permissionsService.getOverviewPermissions),
    async (req, res, next) => {
      return beliefHistoryController.displayBeliefHistory(req, res)
    },
  )

  get(
    `${basePath}/past-care-needs`,
    auditPageAccessAttempt({ services, page: Page.ReligionBeliefHistory }),
    getPrisonerData(services, { minimal: true }),
    permissionsGuard(services.permissionsService.getOverviewPermissions),
    async (req, res, next) => {
      return careNeedsController.displayPastCareNeeds(req, res)
    },
  )

  get('/', (req, res, next) => {
    res.redirect(`${config.serviceUrls.digitalPrison}`)
  })

  get('/save-backlink', saveBackLink())

  return router
}
