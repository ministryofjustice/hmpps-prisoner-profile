import { Router } from 'express'
import { Services } from '../services'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import ProfessionalContactsController from '../controllers/professionalContactsController'
import { getRequest } from './routerUtils'
import permissionsGuard from '../middleware/permissionsGuard'

export default function professionalContactsRouter(services: Services): Router {
  const router = Router()
  const get = getRequest(router)
  const basePath = '/prisoner/:prisonerNumber([a-zA-Z][0-9]{4}[a-zA-Z]{2})'

  const professionalContactsController = new ProfessionalContactsController(services.professionalContactsService)

  get(
    `${basePath}/professional-contacts`,
    getPrisonerData(services, { minimal: true }),
    permissionsGuard(services.permissionsService.getStandardAccessPermission),
    (req, res, next) => professionalContactsController.displayProfessionalContacts(req, res),
  )

  return router
}
