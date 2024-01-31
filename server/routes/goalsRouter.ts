import { RequestHandler, Router } from 'express'
import { Services } from '../services'
import asyncMiddleware from '../middleware/asyncMiddleware'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import checkPrisonerInCaseload from '../middleware/checkPrisonerInCaseloadMiddleware'
import GoalsController from '../controllers/goalsController'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { Page } from '../services/auditService'

export default function goalsRouter(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], ...handlers: RequestHandler[]) =>
    router.get(
      path,
      handlers.map(handler => asyncMiddleware(handler)),
    )

  const goalsController = new GoalsController(services.workAndSkillsPageService, services.auditService)

  get(
    '/prisoner/:prisonerNumber/goals',
    auditPageAccessAttempt({ services, page: Page.Goals }),
    getPrisonerData(services, { minimal: true }),
    checkPrisonerInCaseload(),
    (req, res, next) => goalsController.displayGoals(req, res),
  )

  return router
}
