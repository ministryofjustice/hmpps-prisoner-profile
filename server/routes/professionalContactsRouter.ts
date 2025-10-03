import { Router } from 'express'
import { PrisonerBasePermission, prisonerPermissionsGuard } from '@ministryofjustice/hmpps-prison-permissions-lib'
import { Services } from '../services'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import ProfessionalContactsController from '../controllers/professionalContactsController'

export default function professionalContactsRouter(services: Services): Router {
  const router = Router()
  const basePath = '/prisoner/:prisonerNumber'
  const { prisonPermissionsService } = services

  const professionalContactsController = new ProfessionalContactsController(services.professionalContactsService)

  router.get(
    `${basePath}/professional-contacts`,
    getPrisonerData(services, { minimal: true }),
    prisonerPermissionsGuard(prisonPermissionsService, { requestDependentOn: [PrisonerBasePermission.read] }),
    (req, res) => professionalContactsController.displayProfessionalContacts(req, res),
  )

  return router
}
