import { RequestHandler, Router } from 'express'
import { Services } from '../services'
import asyncMiddleware from '../middleware/asyncMiddleware'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import checkPrisonerInCaseload from '../middleware/checkPrisonerInCaseloadMiddleware'
import ProfessionalContactsController from '../controllers/professionalContactsController'

export default function professionalContactsRouter(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], ...handlers: RequestHandler[]) =>
    router.get(
      path,
      handlers.map(handler => asyncMiddleware(handler)),
    )

  const professionalContactsController = new ProfessionalContactsController(services.professionalContactsService)

  get(
    '/prisoner/:prisonerNumber/professional-contacts',
    getPrisonerData(services, { minimal: true }),
    checkPrisonerInCaseload(),
    (req, res, next) => professionalContactsController.displayProfessionalContacts(req, res),
  )

  return router
}
