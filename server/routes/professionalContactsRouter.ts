import { Router } from 'express'
import { Services } from '../services'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import checkPrisonerInCaseload from '../middleware/checkPrisonerInCaseloadMiddleware'
import ProfessionalContactsController from '../controllers/professionalContactsController'
import { getRequest } from './routerUtils'

export default function professionalContactsRouter(services: Services): Router {
  const router = Router()
  const get = getRequest(router)

  const professionalContactsController = new ProfessionalContactsController(services.professionalContactsService)

  get(
    '/prisoner/:prisonerNumber/professional-contacts',
    getPrisonerData(services, { minimal: true }),
    checkPrisonerInCaseload(services),
    (req, res, next) => professionalContactsController.displayProfessionalContacts(req, res),
  )

  return router
}
