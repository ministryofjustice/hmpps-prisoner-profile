import { Router } from 'express'
import { Services } from '../services'
import AlertsController from '../controllers/alertsController'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import validationMiddleware from '../middleware/validationMiddleware'
import {
  AlertAddMoreDetailsValidator,
  AlertChangeEndDateValidator,
  AlertCloseValidator,
  AlertValidator,
} from '../validators/alertValidator'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { Page } from '../services/auditService'
import { getRequest, postRequest } from './routerUtils'
import permissionsGuard from '../middleware/permissionsGuard'

export default function alertsRouter(services: Services): Router {
  const router = Router()
  const get = getRequest(router)
  const post = postRequest(router)

  const alertsController = new AlertsController(services.alertsService, services.auditService)

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
    permissionsGuard(services.permissionsService.getAlertsPermissions),
    (req, res, next) => {
      alertsController.displayAlerts(req, res, next, true)
    },
  )

  get(
    '/prisoner/:prisonerNumber/alerts/inactive',
    auditPageAccessAttempt({ services, page: Page.InactiveAlerts }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getAlertsPermissions),
    (req, res, next) => {
      alertsController.displayAlerts(req, res, next, false)
    },
  )

  get(
    '/prisoner/:prisonerNumber/add-alert',
    auditPageAccessAttempt({ services, page: Page.AddAlert }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getEditAlertsPermissions),
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
    permissionsGuard(services.permissionsService.getStandardAccessPermission),
    alertsController.displayAlert(),
  )

  get(
    '/prisoner/:prisonerNumber/alerts/:alertId/add-more-details',
    auditPageAccessAttempt({ services, page: Page.AlertAddMoreDetails }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getEditAlertsPermissions),
    (req, res, next) => {
      alertsController.displayAddMoreDetails(req, res, next)
    },
  )

  post(
    '/prisoner/:prisonerNumber/alerts/:alertId/add-more-details',
    auditPageAccessAttempt({ services, page: Page.PostAlertAddMoreDetails }),
    validationMiddleware(AlertAddMoreDetailsValidator),
    alertsController.postAddMoreDetails(),
  )

  get(
    '/prisoner/:prisonerNumber/alerts/:alertId/close',
    auditPageAccessAttempt({ services, page: Page.AlertClose }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getEditAlertsPermissions),
    (req, res, next) => {
      alertsController.displayCloseAlert(req, res, next)
    },
  )

  post(
    '/prisoner/:prisonerNumber/alerts/:alertId/close',
    auditPageAccessAttempt({ services, page: Page.PostAlertClose }),
    validationMiddleware(AlertCloseValidator),
    alertsController.postCloseAlert(),
  )

  get(
    '/prisoner/:prisonerNumber/alerts/:alertId/change-end-date',
    auditPageAccessAttempt({ services, page: Page.AlertClose }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getEditAlertsPermissions),
    (req, res, next) => {
      alertsController.displayChangeEndDate(req, res, next)
    },
  )

  post(
    '/prisoner/:prisonerNumber/alerts/:alertId/change-end-date',
    auditPageAccessAttempt({ services, page: Page.PostAlertClose }),
    validationMiddleware(AlertChangeEndDateValidator),
    alertsController.postChangeEndDate(),
  )

  /**
   * API Routes - called from JavaScript on page
   */
  get(
    '/api/prisoner/:prisonerNumber/get-alert-details',
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getStandardAccessPermission),
    alertsController.getAlertDetails(),
  )

  return router
}
