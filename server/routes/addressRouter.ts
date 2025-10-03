import { Router } from 'express'
import { PrisonerBasePermission, prisonerPermissionsGuard } from '@ministryofjustice/hmpps-prison-permissions-lib'
import AddressController from '../controllers/addressController'
import { Services } from '../services'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { ApiAction, Page } from '../services/auditService'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'

export default function addressRouter(services: Services): Router {
  const router = Router()
  const basePath = '/prisoner/:prisonerNumber'
  const { prisonPermissionsService } = services

  const addressController = new AddressController(services.addressService, services.auditService)

  router.get(
    `${basePath}/addresses`,
    auditPageAccessAttempt({ services, page: Page.Addresses }),
    getPrisonerData(services, { minimal: true }),
    prisonerPermissionsGuard(prisonPermissionsService, { requestDependentOn: [PrisonerBasePermission.read] }),
    (req, res) => addressController.displayAddresses(req, res),
  )

  router.get(
    '/api/addresses/find/:query',
    auditPageAccessAttempt({ services, page: ApiAction.AddressLookup }),
    (req, res) => addressController.findAddressesByFreeTextQuery(req, res),
  )

  return router
}
