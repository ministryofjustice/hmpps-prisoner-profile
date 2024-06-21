import { NextFunction, Request, Response, Router } from 'express'
import { getRequest, postRequest } from './routerUtils'
import PersonalController from '../controllers/personalController'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { Page } from '../services/auditService'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import checkPrisonerInCaseload from '../middleware/checkPrisonerInCaseloadMiddleware'
import { Services } from '../services'
import permissionsGuard from '../middleware/permissionsGuard'
import { userHasRoles } from '../utils/utils'
import { addMiddlewareError } from '../middleware/middlewareHelpers'
import NotFoundError from '../utils/notFoundError'
import { HmppsStatusCode } from '../data/enums/hmppsStatusCode'

export default function personalRouter(services: Services): Router {
  const router = Router()
  const basePath = '/prisoner/:prisonerNumber/personal'
  const get = getRequest(router)
  const post = postRequest(router)

  const personalController = new PersonalController(
    services.personalPageService,
    services.careNeedsService,
    services.auditService,
  )

  get(
    basePath,
    auditPageAccessAttempt({ services, page: Page.Personal }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getOverviewPermissions),
    personalController.displayPersonalPage(),
  )

  // Edit routes
  // Temporary edit check for now
  const editRouteChecks = () => (req: Request, res: Response, next: NextFunction) => {
    const { userRoles } = res.locals.user
    if (userHasRoles(['DPS_APPLICATION_DEVELOPER'], userRoles)) {
      return next()
    }
    return next(
      addMiddlewareError(req, next, new NotFoundError('User cannot access edit routes', HmppsStatusCode.NOT_FOUND)),
    )
  }

  // Height - Metric
  get(
    `${basePath}/edit/height`,
    // TODO: Add role check here
    getPrisonerData(services),
    checkPrisonerInCaseload(),
    editRouteChecks(),
    personalController.height().metric.edit,
  )

  post(
    `${basePath}/edit/height`,
    // TODO: Add role check here
    getPrisonerData(services),
    checkPrisonerInCaseload(),
    editRouteChecks(),
    personalController.height().metric.submit,
  )

  // Height - Imperial
  get(
    `${basePath}/edit/height/imperial`,
    // TODO: Add role check here
    getPrisonerData(services),
    checkPrisonerInCaseload(),
    editRouteChecks(),
    personalController.height().imperial.edit,
  )

  post(
    `${basePath}/edit/height/imperial`,
    // TODO: Add role check here
    getPrisonerData(services),
    checkPrisonerInCaseload(),
    editRouteChecks(),
    personalController.height().imperial.submit,
  )

  return router
}
