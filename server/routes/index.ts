import { type RequestHandler, Router } from 'express'
import config from '../config'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { Prisoner } from '../interfaces/prisoner'
import { mapHeaderData } from '../mappers/headerMappers'
import AlertsController from '../controllers/alertsController'
import CaseNotesController from '../controllers/caseNotesController'
import OverviewController from '../controllers/overviewController'
import {
  SortType,
  formatName,
  prisonerBelongsToUsersCaseLoad,
  sortArrayOfObjectsByDate,
  userHasRoles,
} from '../utils/utils'
import { Role } from '../data/enums/role'
import { saveBackLink } from '../controllers/backLinkController'
import { Services } from '../services'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import { dataAccess } from '../data'

export default function routes(services: Services): Router {
  const router = Router()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function checkPrisonerInCaseLoad(req: any, res: any, func: (prisonerData: Prisoner) => Promise<void>) {
    const prisonerSearchClient = services.dataAccess.prisonerSearchApiClientBuilder(res.locals.clientToken)
    const prisonerData: Prisoner = await prisonerSearchClient.getPrisonerDetails(req.params.prisonerNumber)
    const globalSearchUser = userHasRoles([Role.GlobalSearch], res.locals.user.userRoles)

    if (!prisonerBelongsToUsersCaseLoad(prisonerData.prisonId, res.locals.user.caseLoads) && !globalSearchUser) {
      const inactiveBooking = ['OUT', 'TRN'].some(prisonId => prisonId === prisonerData.prisonId)

      if (inactiveBooking) {
        if (!userHasRoles([Role.InactiveBookings], res.locals.user.userRoles)) {
          return res.render('notFound.njk', {
            url: req.headers.referer,
          })
        }
      } else {
        return res.render('notFound.njk', {
          url: req.headers.referer,
        })
      }
    }

    return func(prisonerData)
  }

  router.use(async (req, res, next) => {
    res.locals = {
      ...res.locals,
      currentUrlPath: req.baseUrl + req.path,
    }
    next()
  })
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const { commonApiRoutes } = services

  const commonRoutes = () => {
    get('/api/prisoner/:prisonerNumber/image', commonApiRoutes.prisonerImage)
    get('/api/image/:imageId', commonApiRoutes.image)
  }

  commonRoutes()

  get('/prisoner/:prisonerNumber', async (req, res, next) => {
    checkPrisonerInCaseLoad(req, res, async () => {
      const overviewController = new OverviewController(
        services.prisonerSearchService,
        services.overviewPageService,
        services.dataAccess.pathfinderApiClientBuilder,
        services.dataAccess.manageSocCasesApiClientBuilder,
      )
      return overviewController.displayOverview(req, res)
    })
  })

  get('/prisoner/:prisonerNumber/image', async (req, res, next) => {
    checkPrisonerInCaseLoad(req, res, async (prisonerData: Prisoner) => {
      res.render('pages/photoPage', {
        pageTitle: `Picture of ${prisonerData.prisonerNumber}`,
        ...mapHeaderData(prisonerData, res.locals.user),
      })
    })
  })

  get('/prisoner/:prisonerNumber/personal', async (req, res, next) => {
    await checkPrisonerInCaseLoad(req, res, async (prisonerData: Prisoner) => {
      const { personalPageService } = services
      const personalPageData = await personalPageService.get(res.locals.clientToken, prisonerData)

      res.render('pages/personalPage', {
        pageTitle: 'Personal',
        ...mapHeaderData(prisonerData, res.locals.user, 'personal'),
        ...personalPageData,
      })
    })
  })

  get('/prisoner/:prisonerNumber/work-and-skills', async (req, res, next) => {
    checkPrisonerInCaseLoad(req, res, async prisonerData => {
      const { workAndSkillsPageService } = services
      const workAndSkillsPageData = await workAndSkillsPageService.get(res.locals.clientToken, prisonerData)

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
  })

  get('/prisoner/:prisonerNumber/alerts', (req, res, next) => {
    checkPrisonerInCaseLoad(req, res, async () => {
      res.redirect(`/prisoner/${req.params.prisonerNumber}/alerts/active`)
    })
  })

  get('/prisoner/:prisonerNumber/alerts/active', async (req, res) => {
    checkPrisonerInCaseLoad(req, res, async () => {
      const alertsController = new AlertsController(true, services.prisonerSearchService, services.alertsPageService)
      return alertsController.displayAlerts(req, res)
    })
  })

  get('/prisoner/:prisonerNumber/alerts/inactive', async (req, res) => {
    checkPrisonerInCaseLoad(req, res, async () => {
      const alertsController = new AlertsController(false, services.prisonerSearchService, services.alertsPageService)
      return alertsController.displayAlerts(req, res)
    })
  })

  get('/prisoner/:prisonerNumber/offences', async (req, res, next) => {
    checkPrisonerInCaseLoad(req, res, async prisonerData => {
      const { offencesPageService } = services
      const offencesPageData = await offencesPageService.get(res.locals.clientToken, prisonerData)

      res.render('pages/offences', {
        pageTitle: 'Offences',
        ...mapHeaderData(prisonerData, res.locals.user, 'offences'),
        ...offencesPageData,
        activeTab: true,
      })
    })
  })

  get('/prisoner/:prisonerNumber/case-notes', async (req, res) => {
    const caseNotesController = new CaseNotesController(
      dataAccess.prisonApiClientBuilder,
      services.prisonerSearchService,
      services.caseNotesService,
    )
    return caseNotesController.displayCaseNotes(req, res)
  })

  get('/prisoner/:prisonerNumber/active-punishments', async (req, res, next) => {
    checkPrisonerInCaseLoad(req, res, async prisonerData => {
      const { activePunishmentsPageService } = services
      const activePunishmentsPageData = await activePunishmentsPageService.get(res.locals.clientToken, prisonerData)

      res.render('pages/activePunishments', {
        pageTitle: 'Active punishments',
        ...mapHeaderData(prisonerData, res.locals.user, 'active-punishments', true),
        ...activePunishmentsPageData,
        activeTab: false,
      })
    })
  })

  get('/prisoner/:prisonerNumber/adjudications', async (req, res, next) => {
    checkPrisonerInCaseLoad(req, res, async prisonerData => {
      res.redirect(`${config.serviceUrls.digitalPrison}/prisoner/${prisonerData.prisonerNumber}/adjudications`)
    })
  })

  get('/prisoner/:prisonerNumber/x-ray-body-scans', async (req, res, next) => {
    checkPrisonerInCaseLoad(req, res, async prisonerData => {
      const prisonApiClient = services.dataAccess.prisonApiClientBuilder(res.locals.clientToken)
      const { personalCareNeeds } = await prisonApiClient.getPersonalCareNeeds(prisonerData.bookingId, ['BSCAN'])

      res.render('pages/xrayBodyScans', {
        pageTitle: 'X-ray body scans',
        ...mapHeaderData(prisonerData, res.locals.user, 'x-ray-body-scans', true),
        prisonerDisplayName: formatName(prisonerData.firstName, prisonerData.middleNames, prisonerData.lastName, {
          style: NameFormatStyle.firstLast,
        }),
        bodyScans: sortArrayOfObjectsByDate(personalCareNeeds, 'startDate', SortType.DESC),
      })
    })
  })

  get('/', (req, res, next) => {
    res.redirect(`${config.serviceUrls.digitalPrison}`)
  })

  get('/save-backlink', saveBackLink())

  return router
}
