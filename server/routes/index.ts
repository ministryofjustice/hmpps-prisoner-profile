import { Router } from 'express'
import {
  isGranted,
  PersonProtectedCharacteristicsPermission,
  PrisonerBaseLocationPermission,
  PrisonerBasePermission,
  PrisonerMoneyPermission,
  prisonerPermissionsGuard,
  PrisonerSchedulePermission,
} from '@ministryofjustice/hmpps-prison-permissions-lib'
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
import probationDocumentsRouter from './probationDocumentsRouter'
import visitsRouter from './visitsRouter'
import addressRouter from './addressRouter'
import retrieveCuriousInPrisonCourses from '../middleware/retrieveCuriousInPrisonCourses'
import CareNeedsController from '../controllers/careNeedsController'
import personalRouter from './personalRouter'
import imageRouter from './imageRouter'
import isServiceNavEnabled from '../utils/isServiceEnabled'
import editRouter from './editRouter'
import { prisonerNumberGuard } from '../middleware/prisonerNumberGuard'
import checkPrisonerIsInUsersCaseloads from '../middleware/checkPrisonerIsInUsersCaseloadsMiddleware'

export const standardGetPaths = /^(?!\/api|\/save-backlink|^\/$).*/

export default function routes(services: Services): Router {
  const router = Router()
  const basePath = '/prisoner/:prisonerNumber'

  router.use(basePath, prisonerNumberGuard())

  router.use(async (req, res, next) => {
    res.locals = {
      ...res.locals,
      currentUrlPath: req.baseUrl + req.path,
      prisonerUrlPath: req.path.replace(/^\/prisoner\/[a-zA-Z][0-9]{4}[a-zA-Z]{2}\/?/, ''),
    }
    next()
  })

  const { prisonPermissionsService } = services
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
    services.csipService,
    services.contactsService,
  )

  const prisonerScheduleController = new PrisonerScheduleController(
    services.dataAccess.prisonApiClientBuilder,
    services.auditService,
  )
  const beliefHistoryController = new BeliefHistoryController(services.beliefService, services.auditService)
  const careNeedsController = new CareNeedsController(services.careNeedsService, services.auditService)

  router.get(
    `/api${basePath}/image`,
    auditPageAccessAttempt({ services, page: ApiAction.PrisonerImage }),
    getPrisonerData(services),
    prisonerPermissionsGuard(prisonPermissionsService, { requestDependentOn: [PrisonerBasePermission.read] }),
    services.commonApiRoutes.prisonerImage,
  )

  router.get(
    '/api/image/:imageId',
    auditPageAccessAttempt({ services, page: ApiAction.Image }),
    services.commonApiRoutes.image,
  )

  router.get(
    '/api/distinguishing-mark-image/:imageId',
    auditPageAccessAttempt({ services, page: ApiAction.Image }),
    services.commonApiRoutes.distinguishingMarkImage,
  )

  router.get('/api/report-error', services.commonApiRoutes.errorReporting)

  router.get(
    `${basePath}`,
    auditPageAccessAttempt({ services, page: Page.Overview }),
    getPrisonerData(services),
    prisonerPermissionsGuard(prisonPermissionsService, { requestDependentOn: [PrisonerBasePermission.read] }),
    async (req, res) => {
      return overviewController.displayOverview(req, res)
    },
  )

  router.get(
    `${basePath}/work-and-skills`,
    auditPageAccessAttempt({ services, page: Page.WorkAndSkills }),
    getPrisonerData(services),
    prisonerPermissionsGuard(prisonPermissionsService, { requestDependentOn: [PrisonerBasePermission.read] }),
    retrieveCuriousInPrisonCourses(services.curiousService),
    async (req, res) => {
      const { apiErrorCallback, user, prisonerPermissions } = res.locals
      const prisonerData = req.middleware?.prisonerData
      const inmateDetail = req.middleware?.inmateDetail
      const alertSummaryData = req.middleware?.alertSummaryData
      const { workAndSkillsPageService } = services
      const workAndSkillsPageData = await workAndSkillsPageService.get(
        req.middleware.clientToken,
        prisonerData,
        apiErrorCallback,
      )

      const fullCourseHistoryLinkUrl = `${config.serviceUrls.learningAndWorkProgress}/prisoner/${prisonerData.prisonerNumber}/work-and-skills/in-prison-courses-and-qualifications`
      const workAndActivities12MonthLinkUrl = `${config.serviceUrls.digitalPrison}/prisoner/${prisonerData.prisonerNumber}/work-activities`
      const workAndActivities7DayLinkUrl = `/prisoner/${prisonerData.prisonerNumber}/schedule`
      const manageAllocationsLinkUrl = `${config.serviceUrls.activities}/prisoner-allocations/${prisonerData.prisonerNumber}`
      const vc2goalsUrl = `/prisoner/${prisonerData.prisonerNumber}/vc2-goals`
      const canEditLearningAndWorkPlan = userHasRoles([Role.LearningAndWorkProgressManager], res.locals.user.userRoles)
      const canManageAllocations =
        config.featureToggles.manageAllocationsEnabled &&
        isGranted(PrisonerSchedulePermission.edit_activity, prisonerPermissions) &&
        isServiceNavEnabled('activities', res.locals.feComponents?.sharedData)

      const { curiousGoals } = workAndSkillsPageData
      const hasVc2Goals =
        curiousGoals.isFulfilled() &&
        (curiousGoals.getOrNull()?.employmentGoals?.length > 0 ||
          curiousGoals.getOrNull()?.personalGoals?.length > 0 ||
          curiousGoals.getOrNull()?.shortTermGoals?.length > 0 ||
          curiousGoals.getOrNull()?.longTermGoals?.length > 0)

      const hasAnyLwpGoals =
        workAndSkillsPageData.personalLearningPlanActionPlan?.activeGoals?.length > 0 ||
        workAndSkillsPageData.personalLearningPlanActionPlan?.archivedGoals?.length > 0 ||
        workAndSkillsPageData.personalLearningPlanActionPlan?.completedGoals?.length > 0
      const hasActiveLwpGoals = workAndSkillsPageData.personalLearningPlanActionPlan?.activeGoals?.length > 0

      const problemRetrievingPrisonerGoalData =
        !curiousGoals.isFulfilled() || workAndSkillsPageData.personalLearningPlanActionPlan?.problemRetrievingData

      await services.auditService.sendPageView({
        user,
        prisonerNumber: prisonerData.prisonerNumber,
        prisonId: prisonerData.prisonId,
        correlationId: req.id,
        page: Page.WorkAndSkills,
      })

      res.render('pages/workAndSkills', {
        ...mapHeaderData(prisonerData, inmateDetail, alertSummaryData, user, prisonerPermissions, 'work-and-skills'),
        ...workAndSkillsPageData,
        pageTitle: 'Work and skills',
        fullCourseHistoryLinkUrl,
        workAndActivities12MonthLinkUrl,
        workAndActivities7DayLinkUrl,
        manageAllocationsLinkUrl,
        canManageAllocations,
        vc2goalsUrl,
        canEditLearningAndWorkPlan,
        hasVc2Goals,
        hasAnyLwpGoals,
        hasActiveLwpGoals,
        problemRetrievingPrisonerGoalData,
      })
    },
  )

  router.get(
    `${basePath}/offences`,
    auditPageAccessAttempt({ services, page: Page.Offences }),
    getPrisonerData(services),
    prisonerPermissionsGuard(prisonPermissionsService, { requestDependentOn: [PrisonerBasePermission.read] }),
    async (req, res) => {
      const prisonerData = req.middleware?.prisonerData
      const inmateDetail = req.middleware?.inmateDetail
      const alertSummaryData = req.middleware?.alertSummaryData
      const { user, prisonerPermissions } = res.locals
      const { offencesPageService } = services
      const { courtCaseData, releaseDates } = await offencesPageService.get(req.middleware.clientToken, prisonerData)

      await services.auditService.sendPageView({
        user,
        prisonerNumber: prisonerData.prisonerNumber,
        prisonId: prisonerData.prisonId,
        correlationId: req.id,
        page: Page.Offences,
      })

      res.render('pages/offences', {
        pageTitle: 'Offences',
        ...mapHeaderData(prisonerData, inmateDetail, alertSummaryData, user, prisonerPermissions, 'offences'),
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
  router.use(editRouter(services))
  router.use(imageRouter(services))

  router.get(
    `${basePath}/schedule`,
    auditPageAccessAttempt({ services, page: Page.Schedule }),
    getPrisonerData(services),
    checkPrisonerIsInUsersCaseloads(),
    prisonerPermissionsGuard(prisonPermissionsService, { requestDependentOn: [PrisonerBasePermission.read] }),
    async (req, res) => {
      const prisonerData = req.middleware?.prisonerData
      return prisonerScheduleController.displayPrisonerSchedule(req, res, prisonerData)
    },
  )

  router.get(
    `${basePath}/x-ray-body-scans`,
    auditPageAccessAttempt({ services, page: Page.XRayBodyScans }),
    getPrisonerData(services, { minimal: true }),
    prisonerPermissionsGuard(prisonPermissionsService, { requestDependentOn: [PrisonerBasePermission.read] }),
    async (req, res) => {
      return careNeedsController.displayXrayBodyScans(req, res)
    },
  )

  router.get(
    `${basePath}/location-history`,
    getPrisonerData(services, { minimal: true }),
    prisonerPermissionsGuard(prisonPermissionsService, {
      requestDependentOn: [PrisonerBaseLocationPermission.read_location_history],
    }),
    async (req, res) => {
      const prisonerData = req.middleware?.prisonerData
      const prisonerLocationHistoryController = new PrisonerLocationHistoryController(
        services.prisonerLocationHistoryService,
      )
      return prisonerLocationHistoryController.displayPrisonerLocationHistory(req, res, prisonerData)
    },
  )

  router.use(
    `${basePath}/money`,
    getPrisonerData(services, { minimal: true }),
    prisonerPermissionsGuard(prisonPermissionsService, { requestDependentOn: [PrisonerMoneyPermission.read] }),
    moneyRouter(services),
  )

  router.get(
    `${basePath}/religion-belief-history`,
    auditPageAccessAttempt({ services, page: Page.ReligionBeliefHistory }),
    getPrisonerData(services, { minimal: true }),
    prisonerPermissionsGuard(prisonPermissionsService, {
      requestDependentOn: [PersonProtectedCharacteristicsPermission.read_religion_and_belief],
    }),
    async (req, res, next) => {
      return beliefHistoryController.displayBeliefHistory(req, res)
    },
  )

  router.get(
    `${basePath}/past-care-needs`,
    auditPageAccessAttempt({ services, page: Page.PastCareNeeds }),
    getPrisonerData(services, { minimal: true }),
    prisonerPermissionsGuard(prisonPermissionsService, { requestDependentOn: [PrisonerBasePermission.read] }),
    async (req, res) => {
      return careNeedsController.displayPastCareNeeds(req, res)
    },
  )

  router.get('/', (_req, res) => {
    res.redirect(`${config.serviceUrls.digitalPrison}`)
  })

  router.get('/save-backlink', saveBackLink())

  return router
}
