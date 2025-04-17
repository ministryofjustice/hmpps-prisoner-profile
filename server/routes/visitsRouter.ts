import { Router } from 'express'
import { Services } from '../services'
import { getRequest } from './routerUtils'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { Page } from '../services/auditService'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import { VisitsController } from '../controllers/visitsController'
import permissionsGuard from '../middleware/permissionsGuard'

export default function visitsRouter(services: Services): Router {
  const router = Router()
  const get = getRequest(router)
  const basePath = '/prisoner/:prisonerNumber([a-zA-Z][0-9]{4}[a-zA-Z]{2})'

  const visitsController = new VisitsController(services.visitsService)

  get(
    `${basePath}/visits-details`,
    auditPageAccessAttempt({ services, page: Page.VisitDetails }),
    getPrisonerData(services, { minimal: true }),
    permissionsGuard(services.permissionsService.getStandardAccessPermission),
    visitsController.visitsDetails(),
  )

  return router
}
