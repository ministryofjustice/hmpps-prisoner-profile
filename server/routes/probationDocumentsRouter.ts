import { Router } from 'express'
import { Services } from '../services'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { Page } from '../services/auditService'
import { getRequest } from './routerUtils'
import ProbationDocumentsController from '../controllers/probationDocumentsController'
import permissionsGuard from '../middleware/permissionsGuard'

export default function probationDocumentsRouter(services: Services): Router {
  const router = Router()
  const get = getRequest(router)

  const probationDocumentsController = new ProbationDocumentsController(
    services.probationDocumentsService,
    services.auditService,
  )

  get(
    '/prisoner/:prisonerNumber/probation-documents',
    auditPageAccessAttempt({ services, page: Page.ProbationDocuments }),
    getPrisonerData(services, { minimal: true }),
    permissionsGuard(services.permissionsService.getProbationDocumentsPermissions),
    (req, res, next) => probationDocumentsController.displayDocuments(req, res),
  )

  return router
}
