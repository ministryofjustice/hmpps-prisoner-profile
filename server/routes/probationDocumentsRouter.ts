import { Router } from 'express'
import { Services } from '../services'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import checkPrisonerInCaseload from '../middleware/checkPrisonerInCaseloadMiddleware'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { Page } from '../services/auditService'
import { getRequest } from './routerUtils'
import ProbationDocumentsController from '../controllers/probationDocumentsController'
import { Role } from '../data/enums/role'
import guardMiddleware, { GuardOperator } from '../middleware/guardMiddleware'
import checkHasSomeRoles from '../middleware/checkHasSomeRolesMiddleware'

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
    guardMiddleware(
      GuardOperator.AND,
      checkPrisonerInCaseload(),
      checkHasSomeRoles([Role.PomUser, Role.ViewProbationDocuments]),
    ),
    (req, res, next) => probationDocumentsController.displayDocuments(req, res),
  )

  return router
}
