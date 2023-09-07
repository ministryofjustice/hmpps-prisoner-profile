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

  const { commonApiRoutes } = services

  const commonRoutes = () => {
    get('/api/prisoner/:prisonerNumber/image', commonApiRoutes.prisonerImage)
    get('/api/image/:imageId', commonApiRoutes.image)
  }

  commonRoutes()

  get('/prisoner/:prisonerNumber', getPrisonerData(services), checkPrisonerInCaseload(), async (req, res, next) => {
    const prisonerData = req.middleware?.prisonerData
    const inmateDetail = req.middleware?.inmateDetail

    const overviewController = new OverviewController(
      services.prisonerSearchService,
      services.overviewPageService,
      services.dataAccess.pathfinderApiClientBuilder,
      services.dataAccess.manageSocCasesApiClientBuilder,
    )
    return overviewController.displayOverview(req, res, prisonerData, inmateDetail)
  })

  get(
    '/prisoner/:prisonerNumber/image',
    getPrisonerData(services),
    checkPrisonerInCaseload(),
    async (req, res, next) => {
      const prisonerData = req.middleware?.prisonerData
      const inmateDetail = req.middleware?.inmateDetail

      res.render('pages/photoPage', {
        pageTitle: `Picture of ${prisonerData.prisonerNumber}`,
        ...mapHeaderData(prisonerData, inmateDetail, res.locals.user),
      })
    },
  )

  get(
    '/prisoner/:prisonerNumber/personal',
    getPrisonerData(services),
    checkPrisonerInCaseload(),
    async (req, res, next) => {
      const prisonerData = req.middleware?.prisonerData
      const inmateDetail = req.middleware?.inmateDetail

      const { personalPageService } = services
      const personalPageData = await personalPageService.get(res.locals.clientToken, prisonerData)

      res.render('pages/personalPage', {
        pageTitle: 'Personal',
        ...mapHeaderData(prisonerData, inmateDetail, res.locals.user, 'personal'),
        ...personalPageData,
      })
    },
  )

  get(
    '/prisoner/:prisonerNumber/work-and-skills',
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
    getPrisonerData(services),
    checkPrisonerInCaseload(),
    async (req, res, next) => {
      const prisonerData = req.middleware?.prisonerData
      const inmateDetail = req.middleware?.inmateDetail
      const { offencesPageService } = services
      const offencesPageData = await offencesPageService.get(res.locals.clientToken, prisonerData)

      res.render('pages/offences', {
        pageTitle: 'Offences',
        ...mapHeaderData(prisonerData, inmateDetail, res.locals.user, 'offences'),
        ...offencesPageData,
        activeTab: true,
      })
    },
  )

  router.use(caseNotesRouter(services))
  router.use(alertsRouter(services))

  get(
    '/prisoner/:prisonerNumber/active-punishments',
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

      return res.render('pages/activePunishments', {
        pageTitle: 'Active punishments',
        ...mapHeaderNoBannerData(prisonerData),
        ...activePunishmentsPageData,
        activeTab: false,
      })
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
      const prisonerCellHistoryController = new PrisonerCellHistoryController(
        services.dataAccess.prisonApiClientBuilder,
      )
      return prisonerCellHistoryController.displayPrisonerCellHistory(req, res, prisonerData)
    },
  )

  get('/', (req, res, next) => {
    res.redirect(`${config.serviceUrls.digitalPrison}`)
  })

  get('/save-backlink', saveBackLink())

  return router
}
