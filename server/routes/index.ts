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
import checkPrisonerInCaseload from '../middleware/checkPrisonerInCaseloadMiddleware'
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
import { PrisonUser } from '../interfaces/HmppsUser'

export const standardGetPaths = /^(?!\/api|\/save-backlink|^\/$).*/

export default function routes(services: Services): Router {
  const router = Router()
  const get = getRequest(router)

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
    services.userService,
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
    '/api/prisoner/:prisonerNumber/image',
    auditPageAccessAttempt({ services, page: ApiAction.PrisonerImage }),
    getPrisonerData(services),
    checkPrisonerInCaseload(),
    services.commonApiRoutes.prisonerImage,
  )

  get(
    '/api/image/:imageId',
    auditPageAccessAttempt({ services, page: ApiAction.Image }),
    services.commonApiRoutes.image,
  )

  get(
    '/prisoner/:prisonerNumber',
    auditPageAccessAttempt({ services, page: Page.Overview }),
    getPrisonerData(services),
    checkPrisonerInCaseload(),
    async (req, res, next) => {
      return overviewController.displayOverview(req, res)
    },
  )

  get(
    '/prisoner/:prisonerNumber/image',
    auditPageAccessAttempt({ services, page: Page.Photo }),
    getPrisonerData(services),
    checkPrisonerInCaseload(),
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
    '/prisoner/:prisonerNumber/personal',
    auditPageAccessAttempt({ services, page: Page.Personal }),
    getPrisonerData(services),
    checkPrisonerInCaseload(),
    async (req, res, next) => {
      const {
        prisonerData,
        inmateDetail,
        alertSummaryData: { alertFlags },
        clientToken,
      } = req.middleware
      const { bookingId } = prisonerData
      const user = res.locals.user as PrisonUser
      const { activeCaseLoadId } = user

      const { personalPageService, careNeedsService } = services

      const enablePrisonPerson =
        config.featureToggles.prisonPersonApiEnabled &&
        config.featureToggles.prisonPersonApiEnabledPrisons.includes(activeCaseLoadId)

      const [personalPageData, careNeeds, xrays] = await Promise.all([
        personalPageService.get(clientToken, prisonerData, enablePrisonPerson),
        careNeedsService.getCareNeedsAndAdjustments(clientToken, bookingId),
        careNeedsService.getXrayBodyScanSummary(clientToken, bookingId),
      ])

      await services.auditService.sendPageView({
        user: res.locals.user,
        prisonerNumber: prisonerData.prisonerNumber,
        prisonId: prisonerData.prisonId,
        correlationId: req.id,
        page: Page.Personal,
      })

      res.render('pages/personalPage', {
        pageTitle: 'Personal',
        ...mapHeaderData(prisonerData, inmateDetail, alertFlags, res.locals.user, 'personal'),
        ...personalPageData,
        careNeeds: careNeeds.filter(need => need.isOngoing).sort((a, b) => b.startDate?.localeCompare(a.startDate)),
        security: { ...personalPageData.security, xrays },
        hasPastCareNeeds: careNeeds.some(need => !need.isOngoing),
      })
    },
  )

  get(
    '/prisoner/:prisonerNumber/work-and-skills',
    auditPageAccessAttempt({ services, page: Page.WorkAndSkills }),
    getPrisonerData(services),
    checkPrisonerInCaseload(),
    // TODO - RR-814 - when this feature toggle is removed the no-op RequestHandler function can be removed, simply leaving the call to the retrieveCuriousInPrisonCourses middleware
    config.featureToggles.newCourseAndQualificationHistoryEnabled
      ? retrieveCuriousInPrisonCourses(services.curiousService)
      : async (req, res, next) => {
          next()
        },
    async (req, res, next) => {
      const prisonerData = req.middleware?.prisonerData
      const inmateDetail = req.middleware?.inmateDetail
      const alertFlags = req.middleware?.alertSummaryData.alertFlags
      const { workAndSkillsPageService } = services
      const workAndSkillsPageData = await workAndSkillsPageService.get(req.middleware.clientToken, prisonerData)

      const fullCourseHistoryLinkUrl = config.featureToggles.newCourseAndQualificationHistoryEnabled
        ? `${config.serviceUrls.learningAndWorkProgress}/prisoner/${prisonerData.prisonerNumber}/work-and-skills/in-prison-courses-and-qualifications`
        : `${config.serviceUrls.digitalPrison}/prisoner/${prisonerData.prisonerNumber}/courses-qualifications`
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
    '/prisoner/:prisonerNumber/offences',
    auditPageAccessAttempt({ services, page: Page.Offences }),
    getPrisonerData(services),
    checkPrisonerInCaseload(),
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

  get(
    '/prisoner/:prisonerNumber/schedule',
    auditPageAccessAttempt({ services, page: Page.Schedule }),
    getPrisonerData(services),
    checkPrisonerInCaseload(),
    async (req, res, next) => {
      const prisonerData = req.middleware?.prisonerData
      return prisonerScheduleController.displayPrisonerSchedule(req, res, prisonerData)
    },
  )

  get(
    '/prisoner/:prisonerNumber/x-ray-body-scans',
    auditPageAccessAttempt({ services, page: Page.XRayBodyScans }),
    getPrisonerData(services, { minimal: true }),
    checkPrisonerInCaseload(),
    async (req, res, next) => {
      return careNeedsController.displayXrayBodyScans(req, res)
    },
  )

  get(
    '/prisoner/:prisonerNumber/location-history',
    getPrisonerData(services),
    checkPrisonerInCaseload(),
    async (req, res, next) => {
      const prisonerData = req.middleware?.prisonerData
      const prisonerLocationHistoryController = new PrisonerLocationHistoryController(
        services.prisonerLocationHistoryService,
      )
      return prisonerLocationHistoryController.displayPrisonerLocationHistory(req, res, prisonerData)
    },
  )

  router.use(
    '/prisoner/:prisonerNumber/money',
    getPrisonerData(services),
    checkPrisonerInCaseload({ allowGlobal: false, allowInactive: false }),
    moneyRouter(services),
  )

  get(
    '/prisoner/:prisonerNumber/religion-belief-history',
    auditPageAccessAttempt({ services, page: Page.ReligionBeliefHistory }),
    getPrisonerData(services, { minimal: true }),
    checkPrisonerInCaseload(),
    async (req, res, next) => {
      return beliefHistoryController.displayBeliefHistory(req, res)
    },
  )

  get(
    '/prisoner/:prisonerNumber/past-care-needs',
    auditPageAccessAttempt({ services, page: Page.ReligionBeliefHistory }),
    getPrisonerData(services, { minimal: true }),
    checkPrisonerInCaseload(),
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
