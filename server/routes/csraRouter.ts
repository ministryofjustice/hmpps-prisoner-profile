import { Router } from 'express'
import { Services } from '../services'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import CsraController from '../controllers/csraController'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { Page } from '../services/auditService'
import { getRequest } from './routerUtils'
import checkCsraAccess from '../middleware/checkCsraAccessMiddleware'

export default function alertsRouter(services: Services): Router {
  const router = Router()
  const get = getRequest(router)

  const csraController = new CsraController(services.csraService, services.auditService)

  get(
    '/prisoner/:prisonerNumber/csra-history',
    auditPageAccessAttempt({ services, page: Page.CsraHistory }),
    getPrisonerData(services, { minimal: true }),
    checkCsraAccess(),
    (req, res, next) => csraController.displayHistory(req, res, next),
  )

  get(
    '/prisoner/:prisonerNumber/csra-review',
    auditPageAccessAttempt({ services, page: Page.CsraReview }),
    getPrisonerData(services, { minimal: true }),
    checkCsraAccess(),
    (req, res, next) => csraController.displayReview(req, res, next),
  )

  return router
}
