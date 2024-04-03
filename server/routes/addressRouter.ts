import { Router } from 'express'
import AddressController from '../controllers/addressController'
import { Services } from '../services'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { Page } from '../services/auditService'
import { getRequest } from './routerUtils'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import checkPrisonerInCaseload from '../middleware/checkPrisonerInCaseloadMiddleware'

export default function addressRouter(services: Services): Router {
  const router = Router()
  const get = getRequest(router)

  const addressController = new AddressController(services.addressService, services.auditService)

  get(
    '/prisoner/:prisonerNumber/addresses',
    auditPageAccessAttempt({ services, page: Page.Addresses }),
    getPrisonerData(services, { minimal: true }),
    checkPrisonerInCaseload(),
    (req, res, next) => addressController.displayAddresses(req, res),
  )

  return router
}
