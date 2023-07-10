import { RequestHandler, Router } from 'express'
import CaseNotesController from '../controllers/caseNotesController'
import { Services } from '../services'
import asyncMiddleware from '../middleware/asyncMiddleware'
import validationMiddleware from '../middleware/validationMiddleware'
import { CaseNoteValidator } from '../validators/caseNoteValidator'

export default function caseNotesRouter(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], ...handlers: RequestHandler[]) =>
    router.get(
      path,
      handlers.map(handler => asyncMiddleware(handler)),
    )
  const post = (path: string | string[], ...handlers: RequestHandler[]) =>
    router.post(
      path,
      handlers.map(handler => asyncMiddleware(handler)),
    )

  const caseNotesController = new CaseNotesController(
    services.dataAccess.prisonApiClientBuilder,
    services.prisonerSearchService,
    services.caseNotesService,
  )

  get('/prisoner/:prisonerNumber/case-notes', caseNotesController.displayCaseNotes())
  get('/prisoner/:prisonerNumber/add-case-note', caseNotesController.displayAddCaseNote())
  post('/prisoner/:prisonerNumber/add-case-note', validationMiddleware(CaseNoteValidator), caseNotesController.post())

  return router
}
