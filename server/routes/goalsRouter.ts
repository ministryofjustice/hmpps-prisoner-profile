import { Router } from 'express'
import { Services } from '../services'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import GoalsController from '../controllers/goalsController'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { Page } from '../services/auditService'
import { getRequest } from './routerUtils'
import permissionsGuard from '../middleware/permissionsGuard'

export default function goalsRouter(services: Services): Router {
  const router = Router()
  const get = getRequest(router)
  const basePath = '/prisoner/:prisonerNumber([a-zA-Z][0-9]{4}[a-zA-Z]{2})'

  const goalsController = new GoalsController(services.workAndSkillsPageService, services.auditService)

  get(
    `${basePath}/vc2-goals`,
    auditPageAccessAttempt({ services, page: Page.VirtualCampusGoals }),
    getPrisonerData(services, { minimal: true }),
    permissionsGuard(services.permissionsService.getStandardAccessPermission),
    (req, res, next) => goalsController.displayGoals(req, res),
  )

  return router
}
