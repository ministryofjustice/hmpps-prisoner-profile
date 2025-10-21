import { Router } from 'express'
import { Services } from '../services'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import CsraController from '../controllers/csraController'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { Page } from '../services/auditService'
import checkPrisonerIsInUsersCaseloads from '../middleware/checkPrisonerIsInUsersCaseloadsMiddleware'

export default function alertsRouter(services: Services): Router {
  const router = Router()
  const basePath = '/prisoner/:prisonerNumber'

  const csraController = new CsraController(services.csraService, services.auditService)

  router.get(
    `${basePath}/csra-history`,
    auditPageAccessAttempt({ services, page: Page.CsraHistory }),
    getPrisonerData(services, { minimal: true }),
    checkPrisonerIsInUsersCaseloads(),
    (req, res) => csraController.displayHistory(req, res),
  )

  router.get(
    `${basePath}/csra-review`,
    auditPageAccessAttempt({ services, page: Page.CsraReview }),
    getPrisonerData(services, { minimal: true }),
    checkPrisonerIsInUsersCaseloads(),
    (req, res) => csraController.displayReview(req, res),
  )

  return router
}
