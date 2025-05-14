import { Router } from 'express'
import { PrisonerBasePermission, prisonerPermissionsGuard } from '@ministryofjustice/hmpps-prison-permissions-lib'
import AddressController from '../controllers/addressController'
import { Services } from '../services'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { ApiAction, Page } from '../services/auditService'
import { getRequest } from './routerUtils'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'

export default function addressRouter(services: Services): Router {
  const router = Router()
  const get = getRequest(router)
  const basePath = '/prisoner/:prisonerNumber([a-zA-Z][0-9]{4}[a-zA-Z]{2})'
  const { prisonPermissionsService } = services

  const addressController = new AddressController(services.addressService, services.auditService)

  get(
    `${basePath}/addresses`,
    auditPageAccessAttempt({ services, page: Page.Addresses }),
    getPrisonerData(services, { minimal: true }),
    prisonerPermissionsGuard(prisonPermissionsService, { requestDependentOn: [PrisonerBasePermission.read] }),
    (req, res, next) => addressController.displayAddresses(req, res),
  )

  get(
    '/api/addresses/find/:query',
    auditPageAccessAttempt({ services, page: ApiAction.AddressLookup }),
    (req, res, next) => addressController.findAddressesByFreeTextQuery(req, res),
  )

  return router
}
