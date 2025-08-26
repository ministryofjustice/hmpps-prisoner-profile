import { Router } from 'express'
import { prisonerPermissionsGuard, ProbationDocumentsPermission } from '@ministryofjustice/hmpps-prison-permissions-lib'
import { Services } from '../services'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { Page } from '../services/auditService'
import { getRequest } from './routerUtils'
import ProbationDocumentsController from '../controllers/probationDocumentsController'

export default function probationDocumentsRouter(services: Services): Router {
  const router = Router()
  const get = getRequest(router)
  const basePath = '/prisoner/:prisonerNumber'
  const { prisonPermissionsService } = services

  const probationDocumentsController = new ProbationDocumentsController(
    services.probationDocumentsService,
    services.auditService,
  )

  get(
    `${basePath}/probation-documents`,
    auditPageAccessAttempt({ services, page: Page.ProbationDocuments }),
    getPrisonerData(services, { minimal: true }),
    prisonerPermissionsGuard(prisonPermissionsService, { requestDependentOn: [ProbationDocumentsPermission.read] }),
    (req, res, next) => probationDocumentsController.displayDocuments(req, res),
  )

  return router
}
