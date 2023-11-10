import { type RequestHandler, Router } from 'express'
import config from '../config'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { mapHeaderData, mapHeaderNoBannerData } from '../mappers/headerMappers'
import OverviewController from '../controllers/overviewController'
import { formatName, sortArrayOfObjectsByDate, SortType } from '../utils/utils'
import { Role } from '../data/enums/role'
import { saveBackLink } from '../controllers/backLinkController'
import { Services } from '../services'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import caseNotesRouter from './caseNotesRouter'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import guardMiddleware, { GuardOperator } from '../middleware/guardMiddleware'
import checkPrisonerInCaseload from '../middleware/checkPrisonerInCaseloadMiddleware'
import checkHasSomeRoles from '../middleware/checkHasSomeRolesMiddleware'
import PrisonerCellHistoryController from '../controllers/prisonerCellHistoryController'
import alertsRouter from './alertsRouter'
import PrisonerScheduleController from '../controllers/prisonerScheduleController'
import getFrontendComponents from '../middleware/frontEndComponents'
import csraRouter from './csraRouter'
import moneyRouter from './moneyRouter'
import appointmentRouter from './appointmentRouter'
import professionalContactsRouter from './professionalContactsRouter'
import { Page } from '../services/auditService'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'

export default function routes(services: Services): Router {
  const router = Router()

  router.use(async (req, res, next) => {
    res.locals = {
      ...res.locals,
      currentUrlPath: req.baseUrl + req.path,
    }
    next()
  })

  const get = (path: string | string[], ...handlers: RequestHandler[]) =>
    router.get(
      path,
      handlers.map(handler => asyncMiddleware(handler)),
    )

  const overviewController = new OverviewController(
    services.prisonerSearchService,
    services.overviewPageService,
    services.dataAccess.pathfinderApiClientBuilder,
    services.dataAccess.manageSocCasesApiClientBuilder,
    services.auditService,
  )

  const prisonerScheduleController = new PrisonerScheduleController(services.dataAccess.prisonApiClientBuilder)
  const prisonerCellHistoryController = new PrisonerCellHistoryController(services.dataAccess.prisonApiClientBuilder)

  get(
    '/api/prisoner/:prisonerNumber/image',
    getPrisonerData(services),
    checkPrisonerInCaseload(),
    services.commonApiRoutes.prisonerImage,
  )

  get('/api/image/:imageId', services.commonApiRoutes.image)

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
        userId: res.locals.user.username,
        userCaseLoads: res.locals.user.caseLoads,
        userRoles: res.locals.user.userRoles,
        prisonerNumber: prisonerData.prisonerNumber,
        prisonId: prisonerData.prisonId,
        requestId: res.locals.requestId,
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
      const personalPageData = await personalPageService.get(res.locals.clientToken, prisonerData)

      await services.auditService.sendPageView({
        userId: res.locals.user.username,
        userCaseLoads: res.locals.user.caseLoads,
        userRoles: res.locals.user.userRoles,
        prisonerNumber: prisonerData.prisonerNumber,
        prisonId: prisonerData.prisonId,
        requestId: res.locals.requestId,
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
    async (req, res, next) => {
      const prisonerData = req.middleware?.prisonerData
      const inmateDetail = req.middleware?.inmateDetail
      const { workAndSkillsPageService } = services
      const workAndSkillsPageData = await workAndSkillsPageService.get(res.locals.clientToken, prisonerData)

      const fullCourseHistoryLinkUrl = `${config.serviceUrls.digitalPrison}/prisoner/${prisonerData.prisonerNumber}/courses-qualifications`
      const workAndActivities12MonthLinkUrl = `${config.serviceUrls.digitalPrison}/prisoner/${prisonerData.prisonerNumber}/work-activities`
      const workAndActivities7DayLinkUrl = `${config.serviceUrls.digitalPrison}/prisoner/${prisonerData.prisonerNumber}/schedule`

      await services.auditService.sendPageView({
        userId: res.locals.user.username,
        userCaseLoads: res.locals.user.caseLoads,
        userRoles: res.locals.user.userRoles,
        prisonerNumber: prisonerData.prisonerNumber,
        prisonId: prisonerData.prisonId,
        requestId: res.locals.requestId,
        page: Page.WorkAndSkills,
      })

      res.render('pages/workAndSkills', {
        ...mapHeaderData(prisonerData, inmateDetail, res.locals.user, 'work-and-skills'),
        ...workAndSkillsPageData,
        pageTitle: 'Work and skills',
        fullCourseHistoryLinkUrl,
        workAndActivities12MonthLinkUrl,
        workAndActivities7DayLinkUrl,
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
      const { courtCaseData, releaseDates } = await offencesPageService.get(res.locals.clientToken, prisonerData)

      await services.auditService.sendPageView({
        userId: res.locals.user.username,
        userCaseLoads: res.locals.user.caseLoads,
        userRoles: res.locals.user.userRoles,
        prisonerNumber: prisonerData.prisonerNumber,
        prisonId: prisonerData.prisonId,
        requestId: res.locals.requestId,
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

  get(
    '/prisoner/:prisonerNumber/active-punishments',
    auditPageAccessAttempt({ services, page: Page.ActivePunishments }),
    getPrisonerData(services),
    guardMiddleware(
      GuardOperator.OR,
      checkPrisonerInCaseload({ allowGlobal: false, allowInactive: false }),
      checkHasSomeRoles([Role.ReceptionUser, Role.PomUser]),
    ),
    async (req, res, next) => {
      const prisonerData = req.middleware?.prisonerData
      const { activePunishmentsPageService } = services
      const activePunishmentsPageData = await activePunishmentsPageService.get(res.locals.clientToken, prisonerData)

      await services.auditService.sendPageView({
        userId: res.locals.user.username,
        userCaseLoads: res.locals.user.caseLoads,
        userRoles: res.locals.user.userRoles,
        prisonerNumber: prisonerData.prisonerNumber,
        prisonId: prisonerData.prisonId,
        requestId: res.locals.requestId,
        page: Page.ActivePunishments,
      })

      return res.render('pages/activePunishments', {
        pageTitle: 'Active punishments',
        ...mapHeaderNoBannerData(prisonerData),
        ...activePunishmentsPageData,
        activeTab: false,
      })
    },
  )

  get(
    '/prisoner/:prisonerNumber/schedule',
    getPrisonerData(services),
    checkPrisonerInCaseload(),
    async (req, res, next) => {
      const prisonerData = req.middleware?.prisonerData
      return prisonerScheduleController.displayPrisonerSchedule(req, res, prisonerData)
    },
  )

  get('/prisoner/:prisonerNumber/adjudications', async (req, res, next) => {
    res.redirect(`${config.serviceUrls.digitalPrison}/prisoner/${req.params.prisonerNumber}/adjudications`)
  })

  get(
    '/prisoner/:prisonerNumber/x-ray-body-scans',
    getPrisonerData(services),
    checkPrisonerInCaseload(),
    async (req, res, next) => {
      const prisonerData = req.middleware?.prisonerData
      const inmateDetail = req.middleware?.inmateDetail
      const prisonApiClient = services.dataAccess.prisonApiClientBuilder(res.locals.clientToken)
      const { personalCareNeeds } = await prisonApiClient.getPersonalCareNeeds(prisonerData.bookingId, ['BSCAN'])

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
    '/prisoner/:prisonerNumber/location-details',
    getPrisonerData(services),
    checkPrisonerInCaseload(),
    async (req, res, next) => {
      const prisonerData = req.middleware?.prisonerData
      return prisonerCellHistoryController.displayPrisonerCellHistory(req, res, prisonerData)
    },
  )

  router.use(
    '/prisoner/:prisonerNumber/money',
    getPrisonerData(services),
    checkPrisonerInCaseload({ allowGlobal: false, allowInactive: false }),
    moneyRouter(services),
  )

  get('/', (req, res, next) => {
    res.redirect(`${config.serviceUrls.digitalPrison}`)
  })

  get('/save-backlink', saveBackLink())

  return router
}
