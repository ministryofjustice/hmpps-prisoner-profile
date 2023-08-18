import { NextFunction, Request, type RequestHandler, Response, Router } from 'express'
import config from '../config'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { Prisoner } from '../interfaces/prisoner'
import { mapHeaderData } from '../mappers/headerMappers'
import AlertsController from '../controllers/alertsController'
import OverviewController from '../controllers/overviewController'
import {
  formatName,
  prisonerBelongsToUsersCaseLoad,
  sortArrayOfObjectsByDate,
  SortType,
  userHasRoles,
} from '../utils/utils'
import { Role } from '../data/enums/role'
import { saveBackLink } from '../controllers/backLinkController'
import { Services } from '../services'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import { AssessmentCode } from '../data/enums/assessmentCode'
import { Assessment } from '../interfaces/prisonApi/assessment'
import caseNotesRouter from './caseNotesRouter'
import { InmateDetail } from '../interfaces/prisonApi/inmateDetail'

export default function routes(services: Services): Router {
  const router = Router()

  async function checkPrisonerInCaseLoad(
    req: Request,
    res: Response,
    next: NextFunction,
    func: (prisonerData: Prisoner, inmateDetail: InmateDetail) => Promise<void>,
  ) {
    const prisonerSearchClient = services.dataAccess.prisonerSearchApiClientBuilder(res.locals.clientToken)
    const prisonerData: Prisoner = await prisonerSearchClient.getPrisonerDetails(req.params.prisonerNumber)
    const prisonApiClient = services.dataAccess.prisonApiClientBuilder(res.locals.clientToken)
    const [assessments, inmateDetail] = await Promise.all([
      await prisonApiClient.getAssessments(prisonerData.bookingId),
      await prisonApiClient.getInmateDetail(prisonerData.bookingId),
    ])

    if (assessments && Array.isArray(assessments)) {
      prisonerData.assessments = assessments
    }
    prisonerData.csra = prisonerData.assessments?.find(
      (assessment: Assessment) => assessment.assessmentCode === AssessmentCode.csra,
    )?.classification
    const globalSearchUser = userHasRoles([Role.GlobalSearch], res.locals.user.userRoles)

    if (!prisonerBelongsToUsersCaseLoad(prisonerData.prisonId, res.locals.user.caseLoads) && !globalSearchUser) {
      const inactiveBooking = ['OUT', 'TRN'].some(prisonId => prisonId === prisonerData.prisonId)

      if (inactiveBooking) {
        if (!userHasRoles([Role.InactiveBookings], res.locals.user.userRoles)) {
          return next()
        }
      } else {
        return next()
      }
    }

    return func(prisonerData, inmateDetail)
  }

  async function checkPrisonerExists(
    req: Request,
    res: Response,
    next: NextFunction,
    func: (prisonerData: Prisoner) => Promise<void>,
  ) {
    const prisonerSearchClient = services.dataAccess.prisonerSearchApiClientBuilder(res.locals.clientToken)
    const prisonerData: Prisoner = await prisonerSearchClient.getPrisonerDetails(req.params.prisonerNumber)

    if (prisonerData.prisonerNumber === undefined) {
      return next()
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
    await checkPrisonerExists(req, res, next, async () => {
      checkPrisonerInCaseLoad(req, res, next, async (prisonerData, inmateDetail) => {
        const overviewController = new OverviewController(
          services.prisonerSearchService,
          services.overviewPageService,
          services.dataAccess.pathfinderApiClientBuilder,
          services.dataAccess.manageSocCasesApiClientBuilder,
        )
        return overviewController.displayOverview(req, res, prisonerData, inmateDetail)
      })
    })
  })

  get('/prisoner/:prisonerNumber/image', async (req, res, next) => {
    await checkPrisonerExists(req, res, next, async () => {
      checkPrisonerInCaseLoad(req, res, next, async (prisonerData: Prisoner, inmateDetail: InmateDetail) => {
        res.render('pages/photoPage', {
          pageTitle: `Picture of ${prisonerData.prisonerNumber}`,
          ...mapHeaderData(prisonerData, inmateDetail, res.locals.user),
        })
      })
    })
  })

  get('/prisoner/:prisonerNumber/personal', async (req, res, next) => {
    await checkPrisonerExists(req, res, next, async () => {
      await checkPrisonerInCaseLoad(req, res, next, async (prisonerData: Prisoner, inmateDetail: InmateDetail) => {
        const { personalPageService } = services
        const personalPageData = await personalPageService.get(res.locals.clientToken, prisonerData)

        res.render('pages/personalPage', {
          pageTitle: 'Personal',
          ...mapHeaderData(prisonerData, inmateDetail, res.locals.user, 'personal'),
          ...personalPageData,
        })
      })
    })
  })

  get('/prisoner/:prisonerNumber/work-and-skills', async (req, res, next) => {
    await checkPrisonerExists(req, res, next, async () => {
      checkPrisonerInCaseLoad(req, res, next, async (prisonerData, inmateDetail) => {
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
      })
    })
  })

  get('/prisoner/:prisonerNumber/alerts', async (req, res, next) => {
    await checkPrisonerExists(req, res, next, async () => {
      res.redirect(`/prisoner/${req.params.prisonerNumber}/alerts/active`)
    })
  })

  get('/prisoner/:prisonerNumber/alerts/active', async (req, res, next) => {
    await checkPrisonerExists(req, res, next, async () => {
      checkPrisonerInCaseLoad(req, res, next, async (prisonerData, inmateDetail) => {
        const alertsController = new AlertsController(true, services.prisonerSearchService, services.alertsPageService)
        return alertsController.displayAlerts(req, res, prisonerData, inmateDetail)
      })
    })
  })

  get('/prisoner/:prisonerNumber/alerts/inactive', async (req, res, next) => {
    await checkPrisonerExists(req, res, next, async () => {
      checkPrisonerInCaseLoad(req, res, next, async (prisonerData, inmateDetail) => {
        const alertsController = new AlertsController(false, services.prisonerSearchService, services.alertsPageService)
        return alertsController.displayAlerts(req, res, prisonerData, inmateDetail)
      })
    })
  })

  get('/prisoner/:prisonerNumber/offences', async (req, res, next) => {
    await checkPrisonerExists(req, res, next, async () => {
      await checkPrisonerInCaseLoad(req, res, next, async (prisonerData, inmateDetail) => {
        const { offencesPageService } = services
        const offencesPageData = await offencesPageService.get(res.locals.clientToken, prisonerData)

        res.render('pages/offences', {
          pageTitle: 'Offences',
          ...mapHeaderData(prisonerData, inmateDetail, res.locals.user, 'offences'),
          ...offencesPageData,
          activeTab: true,
        })
      })
    })
  })

  router.use(caseNotesRouter(services))

  get('/prisoner/:prisonerNumber/active-punishments', async (req, res, next) => {
    await checkPrisonerExists(req, res, next, async () => {
      checkPrisonerInCaseLoad(req, res, next, async (prisonerData, inmateDetail) => {
        const { activePunishmentsPageService } = services
        const activePunishmentsPageData = await activePunishmentsPageService.get(res.locals.clientToken, prisonerData)

        res.render('pages/activePunishments', {
          pageTitle: 'Active punishments',
          ...mapHeaderData(prisonerData, inmateDetail, res.locals.user, 'active-punishments', true),
          ...activePunishmentsPageData,
          activeTab: false,
        })
      })
    })
  })

  get('/prisoner/:prisonerNumber/adjudications', async (req, res, next) => {
    await checkPrisonerExists(req, res, next, async () => {
      checkPrisonerInCaseLoad(req, res, next, async prisonerData => {
        res.redirect(`${config.serviceUrls.digitalPrison}/prisoner/${prisonerData.prisonerNumber}/adjudications`)
      })
    })
  })

  get('/prisoner/:prisonerNumber/x-ray-body-scans', async (req, res, next) => {
    await checkPrisonerExists(req, res, next, async () => {
      checkPrisonerInCaseLoad(req, res, next, async (prisonerData, inmateDetail) => {
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
      })
    })
  })

  get('/', (req, res, next) => {
    res.redirect(`${config.serviceUrls.digitalPrison}`)
  })

  get('/save-backlink', saveBackLink())

  return router
}
