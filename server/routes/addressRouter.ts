import { Router } from 'express'
import {
  CorePersonRecordPermission,
  PrisonerBasePermission,
  prisonerPermissionsGuard,
} from '@ministryofjustice/hmpps-prison-permissions-lib'
import AddressController from '../controllers/addressController'
import AddressPhoneNumberController from '../controllers/addressPhoneNumberController'
import { Services } from '../services'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { Page } from '../services/auditService'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import getDuplicatePrisonerData from '../middleware/getDuplicatePrisonerDataMiddleware'
import { featureFlagGuard } from '../middleware/featureFlagGuard'
import { editAddressSpecificPhoneNumbersEnabled, editProfileEnabled } from '../utils/featureFlags'
import validationMiddleware from '../middleware/validationMiddleware'
import { phoneNumberValidator } from '../validators/personal/phoneNumberValidator'

export default function addressRouter(services: Services): Router {
  const router = Router()
  const basePath = '/prisoner/:prisonerNumber'
  const { prisonPermissionsService } = services

  const addressController = new AddressController(services.addressService, services.auditService)
  const addressPhoneNumberController = new AddressPhoneNumberController(services.addressService, services.auditService)

  const addressPhoneNumberMiddleware = [
    featureFlagGuard('Profile Edit', editProfileEnabled),
    featureFlagGuard('Address-specific phone numbers', editAddressSpecificPhoneNumbersEnabled),
    getPrisonerData(services),
    getDuplicatePrisonerData(services),
    prisonerPermissionsGuard(prisonPermissionsService, {
      requestDependentOn: [CorePersonRecordPermission.edit_address],
    }),
  ]

  router.get(
    `${basePath}/addresses/:addressId/add-address-phone-number`,
    auditPageAccessAttempt({ services, page: Page.AddAddressPhoneNumber }),
    ...addressPhoneNumberMiddleware,
    addressPhoneNumberController.display(),
  )

  router.post(
    `${basePath}/addresses/:addressId/add-address-phone-number`,
    auditPageAccessAttempt({ services, page: Page.AddAddressPhoneNumber }),
    ...addressPhoneNumberMiddleware,
    (req, res, next) => {
      if (req.query.removePhoneNumber !== undefined) return next()
      return validationMiddleware([phoneNumberValidator], { redirectBackOnError: true })(req, res, next)
    },
    addressPhoneNumberController.submit(),
  )

  router.get(
    `${basePath}/addresses`,
    auditPageAccessAttempt({ services, page: Page.Addresses }),
    getPrisonerData(services, { minimal: true }),
    getDuplicatePrisonerData(services),
    prisonerPermissionsGuard(prisonPermissionsService, { requestDependentOn: [PrisonerBasePermission.read] }),
    (req, res) => addressController.displayAddresses(req, res),
  )

  // Not audited or requiring a permission since this just returns publicly accessible data:
  router.get('/api/addresses/find/:query', (req, res) => addressController.findAddressesByFreeTextQuery(req, res))

  return router
}
