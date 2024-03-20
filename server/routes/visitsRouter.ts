import { Router } from 'express'
import { Services } from '../services'
import { getRequest } from './routerUtils'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { Page } from '../services/auditService'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import checkPrisonerInCaseload from '../middleware/checkPrisonerInCaseloadMiddleware'
import { VisitsController } from '../controllers/visitsController'

export default function visitsRouter(services: Services): Router {
  const router = Router()
  const get = getRequest(router)
  const visitsController = new VisitsController(services.visitsService)

  get(
    '/prisoner/:prisonerNumber/visits-details',
    auditPageAccessAttempt({ services, page: Page.VisitDetails }),
    getPrisonerData(services),
    checkPrisonerInCaseload(),
    visitsController.visitsDetails(),
  )

  return router
}
