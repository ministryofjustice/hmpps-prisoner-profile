import { NextFunction, Request, RequestHandler, Response, Router } from 'express'
import { getRequest, postRequest } from './routerUtils'
import PersonalController from '../controllers/personalController'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { Page } from '../services/auditService'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import { Services } from '../services'
import permissionsGuard from '../middleware/permissionsGuard'
import { userHasRoles } from '../utils/utils'
import { addMiddlewareError } from '../middleware/middlewareHelpers'
import NotFoundError from '../utils/notFoundError'
import { HmppsStatusCode } from '../data/enums/hmppsStatusCode'

export default function personalRouter(services: Services): Router {
  const router = Router()
  const basePath = '/prisoner/:prisonerNumber([a-zA-Z][0-9]{4}[a-zA-Z]{2})/personal'
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

  const editRoute = ({
    url,
    getMethod,
    submitMethod,
  }: {
    url: string
    getMethod: RequestHandler
    submitMethod: RequestHandler
  }) => {
    get(
      url,
      getPrisonerData(services),
      permissionsGuard(services.permissionsService.getOverviewPermissions),
      editRouteChecks(),
      getMethod,
    )

    post(
      url,
      getPrisonerData(services),
      permissionsGuard(services.permissionsService.getOverviewPermissions),
      editRouteChecks(),
      submitMethod,
    )
  }

  editRoute({
    url: `${basePath}/edit/height`,
    getMethod: personalController.height().metric.edit,
    submitMethod: personalController.height().metric.submit,
  })

  editRoute({
    url: `${basePath}/edit/height/imperial`,
    getMethod: personalController.height().imperial.edit,
    submitMethod: personalController.height().imperial.submit,
  })

  editRoute({
    url: `${basePath}/edit/weight`,
    getMethod: personalController.weight().metric.edit,
    submitMethod: personalController.weight().metric.submit,
  })

  editRoute({
    url: `${basePath}/edit/weight/imperial`,
    getMethod: personalController.weight().imperial.edit,
    submitMethod: personalController.weight().imperial.submit,
  })

  return router
}
