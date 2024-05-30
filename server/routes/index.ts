import { Router } from 'express'
import config from '../config'
import { mapHeaderData } from '../mappers/headerMappers'
import OverviewController from '../controllers/overviewController'
import { formatName, sortArrayOfObjectsByDate, SortType, userHasRoles } from '../utils/utils'
import { Role } from '../data/enums/role'
import { saveBackLink } from '../controllers/backLinkController'
import { Services } from '../services'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import caseNotesRouter from './caseNotesRouter'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import checkPrisonerInCaseload from '../middleware/checkPrisonerInCaseloadMiddleware'
import alertsRouter from './alertsRouter'
import PrisonerScheduleController from '../controllers/prisonerScheduleController'
import getFrontendComponents from '../middleware/frontEndComponents'
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

  get('/prisoner/*', getFrontendComponents(services, config.apis.frontendComponents.latest))

  get(
    '/prisoner/:prisonerNumber',
    auditPageAccessAttempt({ services, page: Page.Overview }),
    getPrisonerData(services),
    checkPrisonerInCaseload(),
    async (req, res, next) => {
      const prisonerData = req.middleware?.prisonerData
      const inmateDetail = req.middleware?.inmateDetail
      return overviewController.displayOverview(req, res, prisonerData, inmateDetail)
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

      await services.auditService.sendPageView({
        user: res.locals.user,
        prisonerNumber: prisonerData.prisonerNumber,
        prisonId: prisonerData.prisonId,
        correlationId: req.id,
        page: Page.Photo,
      })

      res.render('pages/photoPage', {
        pageTitle: `Picture of ${prisonerData.prisonerNumber}`,
        ...mapHeaderData(prisonerData, inmateDetail, res.locals.user),
      })
    },
  )

  get(
    '/prisoner/:prisonerNumber/personal',
    auditPageAccessAttempt({ services, page: Page.Personal }),
    getPrisonerData(services),
    checkPrisonerInCaseload(),
    async (req, res, next) => {
      const prisonerData = req.middleware?.prisonerData
      const inmateDetail = req.middleware?.inmateDetail

      const { personalPageService } = services
      const personalPageData = await personalPageService.get(req.middleware.clientToken, prisonerData)

      await services.auditService.sendPageView({
        user: res.locals.user,
        prisonerNumber: prisonerData.prisonerNumber,
        prisonId: prisonerData.prisonId,
        correlationId: req.id,
        page: Page.Personal,
      })

      res.render('pages/personalPage', {
        pageTitle: 'Personal',
        ...mapHeaderData(prisonerData, inmateDetail, res.locals.user, 'personal'),
        ...personalPageData,
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
        ...mapHeaderData(prisonerData, inmateDetail, res.locals.user, 'work-and-skills'),
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
        ...mapHeaderData(prisonerData, inmateDetail, res.locals.user, 'offences'),
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
    getPrisonerData(services),
    checkPrisonerInCaseload(),
    async (req, res, next) => {
      const prisonerData = req.middleware?.prisonerData
      const inmateDetail = req.middleware?.inmateDetail
      const prisonApiClient = services.dataAccess.prisonApiClientBuilder(req.middleware.clientToken)
      const { personalCareNeeds } = await prisonApiClient.getPersonalCareNeeds(prisonerData.bookingId, ['BSCAN'])

      await services.auditService.sendPageView({
        user: res.locals.user,
        prisonerNumber: prisonerData.prisonerNumber,
        prisonId: prisonerData.prisonId,
        correlationId: req.id,
        page: Page.XRayBodyScans,
      })

      res.render('pages/xrayBodyScans', {
        pageTitle: 'X-ray body scans',
        ...mapHeaderData(prisonerData, inmateDetail, res.locals.user, 'x-ray-body-scans', true),
        prisonerDisplayName: formatName(prisonerData.firstName, prisonerData.middleNames, prisonerData.lastName, {
          style: NameFormatStyle.firstLast,
        }),
        bodyScans: sortArrayOfObjectsByDate(personalCareNeeds, 'startDate', SortType.DESC),
      })
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

  get('/', (req, res, next) => {
    res.redirect(`${config.serviceUrls.digitalPrison}`)
  })

  get('/save-backlink', saveBackLink())

  return router
}
