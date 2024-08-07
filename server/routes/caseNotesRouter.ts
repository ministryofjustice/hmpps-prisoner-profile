import { Router } from 'express'
import CaseNotesController from '../controllers/caseNotesController'
import { Services } from '../services'
import validationMiddleware from '../middleware/validationMiddleware'
import { CaseNoteValidator } from '../validators/caseNoteValidator'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { Page } from '../services/auditService'
import { getRequest, postRequest } from './routerUtils'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import { UpdateCaseNoteValidator } from '../validators/updateCaseNoteValidator'
import permissionsGuard from '../middleware/permissionsGuard'

export default function caseNotesRouter(services: Services): Router {
  const router = Router()
  const get = getRequest(router)
  const post = postRequest(router)
  const basePath = '/prisoner/:prisonerNumber([a-zA-Z][0-9]{4}[a-zA-Z]{2})'

  const caseNotesController = new CaseNotesController(
    services.dataAccess.prisonApiClientBuilder,
    services.caseNotesService,
    services.auditService,
  )

  get(
    `${basePath}/case-notes`,
    auditPageAccessAttempt({ services, page: Page.CaseNotes }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getCaseNotesPermissions),
    caseNotesController.displayCaseNotes(),
  )

  get(
    `${basePath}/add-case-note`,
    auditPageAccessAttempt({ services, page: Page.AddCaseNote }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getCaseNotesPermissions),
    caseNotesController.displayAddCaseNote(),
  )

  post(
    `${basePath}/add-case-note`,
    auditPageAccessAttempt({ services, page: Page.PostAddCaseNote }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getCaseNotesPermissions),
    validationMiddleware([CaseNoteValidator]),
    caseNotesController.post(),
  )

  get(
    `${basePath}/update-case-note/:caseNoteId`,
    auditPageAccessAttempt({ services, page: Page.UpdateCaseNote }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getCaseNotesPermissions),
    caseNotesController.displayUpdateCaseNote(),
  )

  post(
    `${basePath}/update-case-note/:caseNoteId`,
    auditPageAccessAttempt({ services, page: Page.PostUpdateCaseNote }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getCaseNotesPermissions),
    validationMiddleware([UpdateCaseNoteValidator]),
    caseNotesController.postUpdate(),
  )

  return router
}
