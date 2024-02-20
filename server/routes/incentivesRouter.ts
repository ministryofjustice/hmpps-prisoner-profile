import { Router } from 'express'
import IncentivesController from '../controllers/incentivesController'
import { Services } from '../services'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { Page } from '../services/auditService'
import { getRequest } from './routerUtils'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import checkPrisonerInCaseload from '../middleware/checkPrisonerInCaseloadMiddleware'

export default function incentivesRouter(services: Services): Router {
  const router = Router()
  const get = getRequest(router)

  const incentivesController = new IncentivesController(services.incentivesService, services.auditService)

  get(
    '/prisoner/:prisonerNumber/incentive-level-details',
    auditPageAccessAttempt({ services, page: Page.IncentiveLevelDetails }),
    getPrisonerData(services, { minimal: true }),
    checkPrisonerInCaseload(),
    incentivesController.displayIncentiveLevel(),
  )

  return router
}
