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
  const basePath = '/prisoner/:prisonerNumber([a-zA-Z][0-9]{4}[a-zA-Z]{2})'

  const probationDocumentsController = new ProbationDocumentsController(
    services.probationDocumentsService,
    services.auditService,
  )

  get(
    `${basePath}/probation-documents`,
    auditPageAccessAttempt({ services, page: Page.ProbationDocuments }),
    getPrisonerData(services, { minimal: true }),
    permissionsGuard(services.permissionsService.getProbationDocumentsPermissions),
    (req, res, next) => probationDocumentsController.displayDocuments(req, res),
  )

  return router
}
