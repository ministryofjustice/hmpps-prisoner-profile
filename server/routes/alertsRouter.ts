import { RequestHandler, Router } from 'express'
import { Services } from '../services'
import asyncMiddleware from '../middleware/asyncMiddleware'
import AlertsController from '../controllers/alertsController'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import checkPrisonerInCaseload from '../middleware/checkPrisonerInCaseloadMiddleware'
import checkHasSomeRoles from '../middleware/checkHasSomeRolesMiddleware'
import { Role } from '../data/enums/role'
import guardMiddleware, { GuardOperator } from '../middleware/guardMiddleware'
import checkUserCanEdit from '../middleware/checkUserCanEditMiddleware'
import validationMiddleware from '../middleware/validationMiddleware'
import { AlertValidator } from '../validators/alertValidator'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { Page } from '../services/auditService'

export default function alertsRouter(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], ...handlers: RequestHandler[]) =>
    router.get(
      path,
      handlers.map(handler => asyncMiddleware(handler)),
    )
  const post = (path: string | string[], ...handlers: RequestHandler[]) =>
    router.post(
      path,
      handlers.map(handler => asyncMiddleware(handler)),
    )

  const alertsController = new AlertsController(
    services.alertsPageService,
    services.referenceDataService,
    services.auditService,
  )

  get(
    '/prisoner/:prisonerNumber/alerts',
    auditPageAccessAttempt({ services, page: Page.Alerts }),
    async (req, res, next) => {
      res.redirect(`/prisoner/${req.params.prisonerNumber}/alerts/active`)
    },
  )

  get(
    '/prisoner/:prisonerNumber/alerts/active',
    auditPageAccessAttempt({ services, page: Page.ActiveAlerts }),
    getPrisonerData(services),
    checkPrisonerInCaseload(),
    (req, res, next) => {
      alertsController.displayAlerts(req, res, next, true)
    },
  )

  get(
    '/prisoner/:prisonerNumber/alerts/inactive',
    auditPageAccessAttempt({ services, page: Page.InactiveAlerts }),
    getPrisonerData(services),
    checkPrisonerInCaseload(),
    (req, res, next) => {
      alertsController.displayAlerts(req, res, next, false)
    },
  )

  get(
    '/prisoner/:prisonerNumber/add-alert',
    auditPageAccessAttempt({ services, page: Page.AddAlert }),
    getPrisonerData(services),
    guardMiddleware(GuardOperator.OR, checkHasSomeRoles([Role.UpdateAlert]), checkUserCanEdit()),
    (req, res, next) => {
      alertsController.displayAddAlert(req, res, next)
    },
  )

  post(
    '/prisoner/:prisonerNumber/add-alert',
    auditPageAccessAttempt({ services, page: Page.PostAddAlert }),
    validationMiddleware(AlertValidator),
    alertsController.post(),
  )

  get(
    '/prisoner/:prisonerNumber/alerts/detail',
    getPrisonerData(services),
    checkPrisonerInCaseload(),
    alertsController.displayAlert(),
  )

  /**
   * API Routes - called from JavaScript on page
   */
  get(
    '/api/prisoner/:prisonerNumber/get-alert-details',
    getPrisonerData(services),
    checkPrisonerInCaseload(),
    alertsController.getAlertDetails(),
  )

  return router
}
