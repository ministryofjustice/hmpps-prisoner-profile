import { Router } from 'express'
import {
  PrisonerAlertsPermission,
  PrisonerBasePermission,
  prisonerPermissionsGuard,
} from '@ministryofjustice/hmpps-prison-permissions-lib'
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

export default function alertsRouter(services: Services): Router {
  const router = Router()
  const get = getRequest(router)
  const post = postRequest(router)
  const basePath = '/prisoner/:prisonerNumber([a-zA-Z][0-9]{4}[a-zA-Z]{2})'
  const { prisonPermissionsService } = services

  const alertsController = new AlertsController(services.alertsService, services.auditService)

  get(`${basePath}/alerts`, auditPageAccessAttempt({ services, page: Page.Alerts }), async (req, res, next) => {
    res.redirect(`/prisoner/${req.params.prisonerNumber}/alerts/active`)
  })

  get(
    `${basePath}/alerts/active`,
    auditPageAccessAttempt({ services, page: Page.ActiveAlerts }),
    getPrisonerData(services),
    prisonerPermissionsGuard(prisonPermissionsService, { requestDependentOn: [PrisonerBasePermission.read] }),
    (req, res, next) => {
      alertsController.displayAlerts(req, res, next, true)
    },
  )

  get(
    `${basePath}/alerts/inactive`,
    auditPageAccessAttempt({ services, page: Page.InactiveAlerts }),
    getPrisonerData(services),
    prisonerPermissionsGuard(prisonPermissionsService, { requestDependentOn: [PrisonerBasePermission.read] }),
    (req, res, next) => {
      alertsController.displayAlerts(req, res, next, false)
    },
  )

  get(
    `${basePath}/add-alert`,
    auditPageAccessAttempt({ services, page: Page.AddAlert }),
    getPrisonerData(services),
    prisonerPermissionsGuard(prisonPermissionsService, { requestDependentOn: [PrisonerAlertsPermission.edit] }),
    (req, res, next) => {
      alertsController.displayAddAlert(req, res, next)
    },
  )

  post(
    `${basePath}/add-alert`,
    auditPageAccessAttempt({ services, page: Page.PostAddAlert }),
    validationMiddleware([AlertValidator]),
    alertsController.post(),
  )

  get(
    `${basePath}/alerts/detail`,
    getPrisonerData(services),
    prisonerPermissionsGuard(prisonPermissionsService, { requestDependentOn: [PrisonerBasePermission.read] }),
    alertsController.displayAlert(),
  )

  get(
    `${basePath}/alerts/:alertId/add-more-details`,
    auditPageAccessAttempt({ services, page: Page.AlertAddMoreDetails }),
    getPrisonerData(services),
    prisonerPermissionsGuard(prisonPermissionsService, { requestDependentOn: [PrisonerAlertsPermission.edit] }),
    (req, res, next) => {
      alertsController.displayAddMoreDetails(req, res, next)
    },
  )

  post(
    `${basePath}/alerts/:alertId/add-more-details`,
    auditPageAccessAttempt({ services, page: Page.PostAlertAddMoreDetails }),
    validationMiddleware([AlertAddMoreDetailsValidator]),
    alertsController.postAddMoreDetails(),
  )

  get(
    `${basePath}/alerts/:alertId/close`,
    auditPageAccessAttempt({ services, page: Page.AlertClose }),
    getPrisonerData(services),
    prisonerPermissionsGuard(prisonPermissionsService, { requestDependentOn: [PrisonerAlertsPermission.edit] }),
    (req, res, next) => {
      alertsController.displayCloseAlert(req, res, next)
    },
  )

  post(
    `${basePath}/alerts/:alertId/close`,
    auditPageAccessAttempt({ services, page: Page.PostAlertClose }),
    validationMiddleware([AlertCloseValidator]),
    alertsController.postCloseAlert(),
  )

  get(
    `${basePath}/alerts/:alertId/change-end-date`,
    auditPageAccessAttempt({ services, page: Page.AlertClose }),
    getPrisonerData(services),
    prisonerPermissionsGuard(prisonPermissionsService, { requestDependentOn: [PrisonerAlertsPermission.edit] }),
    (req, res, next) => {
      alertsController.displayChangeEndDate(req, res, next)
    },
  )

  post(
    `${basePath}/alerts/:alertId/change-end-date`,
    auditPageAccessAttempt({ services, page: Page.PostAlertClose }),
    validationMiddleware([AlertChangeEndDateValidator]),
    alertsController.postChangeEndDate(),
  )

  /**
   * API Routes - called from JavaScript on page
   */
  get(
    `/api${basePath}/get-alert-details`,
    getPrisonerData(services),
    prisonerPermissionsGuard(prisonPermissionsService, { requestDependentOn: [PrisonerBasePermission.read] }),
    alertsController.getAlertDetails(),
  )

  return router
}
