import { RequestHandler, Router } from 'express'
import CaseNotesController from '../controllers/caseNotesController'
import { Services } from '../services'
import asyncMiddleware from '../middleware/asyncMiddleware'

export default function caseNotesRouter(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string | string[], handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const caseNotesController = new CaseNotesController(
    services.dataAccess.prisonApiClientBuilder,
    services.prisonerSearchService,
    services.caseNotesService,
  )

  get('/prisoner/:prisonerNumber/case-notes', caseNotesController.displayCaseNotes())
  get('/prisoner/:prisonerNumber/add-case-note', caseNotesController.displayAddCaseNote())
  post('/prisoner/:prisonerNumber/add-case-note', caseNotesController.post())

  return router
}
