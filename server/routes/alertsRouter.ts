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

  const alertsController = new AlertsController(services.alertsPageService, services.referenceDataService)

  get('/prisoner/:prisonerNumber/alerts', async (req, res, next) => {
    res.redirect(`/prisoner/${req.params.prisonerNumber}/alerts/active`)
  })

  get(
    '/prisoner/:prisonerNumber/alerts/active',
    getPrisonerData(services),
    checkPrisonerInCaseload(),
    alertsController.displayAlerts(true),
  )

  get(
    '/prisoner/:prisonerNumber/alerts/inactive',
    getPrisonerData(services),
    checkPrisonerInCaseload(),
    alertsController.displayAlerts(false),
  )

  get(
    '/prisoner/:prisonerNumber/add-alert',
    getPrisonerData(services),
    guardMiddleware(GuardOperator.OR, checkHasSomeRoles([Role.UpdateAlert]), checkUserCanEdit()),
    alertsController.displayAddAlert(),
  )

  post('/prisoner/:prisonerNumber/add-alert', validationMiddleware(AlertValidator), alertsController.post())

  return router
}
