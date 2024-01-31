import { Router } from 'express'
import CaseNotesController from '../controllers/caseNotesController'
import { Services } from '../services'
import validationMiddleware from '../middleware/validationMiddleware'
import { CaseNoteValidator } from '../validators/caseNoteValidator'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { Page } from '../services/auditService'
import { getRequest, postRequest } from './routerUtils'

export default function caseNotesRouter(services: Services): Router {
  const router = Router()
  const get = getRequest(router)
  const post = postRequest(router)

  const caseNotesController = new CaseNotesController(
    services.dataAccess.prisonApiClientBuilder,
    services.prisonerSearchService,
    services.caseNotesService,
    services.auditService,
  )

  get(
    '/prisoner/:prisonerNumber/case-notes',
    auditPageAccessAttempt({ services, page: Page.CaseNotes }),
    caseNotesController.displayCaseNotes(),
  )
  get(
    '/prisoner/:prisonerNumber/add-case-note',
    auditPageAccessAttempt({ services, page: Page.AddCaseNote }),
    caseNotesController.displayAddCaseNote(),
  )

  post(
    '/prisoner/:prisonerNumber/add-case-note',
    auditPageAccessAttempt({ services, page: Page.PostAddCaseNote }),
    validationMiddleware(CaseNoteValidator),
    caseNotesController.post(),
  )

  return router
}
