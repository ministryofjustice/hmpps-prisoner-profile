import { Router } from 'express'
import { Services } from '../services'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import checkPrisonerInCaseload from '../middleware/checkPrisonerInCaseloadMiddleware'
import GoalsController from '../controllers/goalsController'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { Page } from '../services/auditService'
import { getRequest } from './routerUtils'

export default function goalsRouter(services: Services): Router {
  const router = Router()
  const get = getRequest(router)

  const goalsController = new GoalsController(services.workAndSkillsPageService, services.auditService)

  get(
    '/prisoner/:prisonerNumber/vc2-goals',
    auditPageAccessAttempt({ services, page: Page.VirtualCampusGoals }),
    getPrisonerData(services, { minimal: true }),
    checkPrisonerInCaseload(services),
    (req, res, next) => goalsController.displayGoals(req, res),
  )

  return router
}
