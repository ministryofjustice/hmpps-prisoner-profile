import { RequestHandler, Router } from 'express'
import {
  PersonalRelationshipsPermission,
  prisonerPermissionsGuard,
} from '@ministryofjustice/hmpps-prison-permissions-lib'
import { getRequest, postRequest } from './routerUtils'
import { Services } from '../services'
import NextOfKinController from '../controllers/nextOfKinController'
import validationMiddleware from '../middleware/validationMiddleware'
import { nextOfKinValidator } from '../validators/personal/nextOfKinValidator'
import { notEmptyValidator } from '../validators/general/notEmptyValidator'
import { AddressLocation } from '../services/mappers/addressMapper'
import { Page, PostAction } from '../services/auditService'
import { addressValidator } from '../validators/personal/addressValidator'
import { featureFlagGuard } from '../middleware/featureFlagGuard'
import { editProfileEnabled } from '../utils/featureToggles'

export default function nextOfKinRouter(services: Services): Router {
  const router = Router({ mergeParams: true })
  const get = getRequest(router)
  const post = postRequest(router)
  const { prisonPermissionsService } = services

  const nextOfKinController = new NextOfKinController(
    services.nextOfKinService,
    services.addressService,
    services.ephemeralDataService,
    services.auditService,
  )

  const commonMiddleware: RequestHandler[] = [
    featureFlagGuard('Profile Edit', editProfileEnabled),
    prisonerPermissionsGuard(prisonPermissionsService, {
      requestDependentOn: [PersonalRelationshipsPermission.edit_emergency_contacts],
    }),
  ]

  get('/next-of-kin-emergency-contacts', ...commonMiddleware, nextOfKinController.displayNextOfKinEmergencyContact())
  post(
    '/next-of-kin-emergency-contacts',
    ...commonMiddleware,
    validationMiddleware([nextOfKinValidator], {
      redirectBackOnError: true,
    }),
    nextOfKinController.submitNextOfKinEmergencyContact(),
  )

  get('/where-is-next-of-kin-address', ...commonMiddleware, nextOfKinController.displayWhereIsTheAddress())
  post(
    '/where-is-next-of-kin-address',
    ...commonMiddleware,
    validationMiddleware(
      [notEmptyValidator({ fieldName: 'radioField', href: '#radio', errorText: 'Select where the address is' })],
      { redirectBackOnError: true, useReq: true },
    ),
    nextOfKinController.submitWhereIsTheAddress(),
  )

  get('/find-uk-next-of-kin-address', ...commonMiddleware, nextOfKinController.displayFindUkAddress())
  post(
    '/find-uk-next-of-kin-address',
    ...commonMiddleware,
    validationMiddleware(
      [
        notEmptyValidator({
          fieldName: 'uprn',
          href: '#address-autosuggest-input',
          getErrorText: req =>
            req.body['address-autosuggest-input'] ? 'This is not a valid address' : 'Enter a UK address',
        }),
      ],
      { redirectBackOnError: true, useReq: true },
    ),
    nextOfKinController.submitFindUkAddress(),
  )

  get(
    '/add-uk-next-of-kin-no-fixed-address',
    ...commonMiddleware,
    nextOfKinController.displayManualEditAddress({
      addressLocation: AddressLocation.no_fixed_address,
      pageTitlePrefix: 'Add UK no fixed address for contact',
      formTitlePrefix: 'Add a UK address',
      auditPage: Page.EditNextOfKinAddressNoFixedAddressManual,
    }),
  )
  post(
    '/add-uk-next-of-kin-no-fixed-address',
    ...commonMiddleware,
    validationMiddleware([addressValidator], { redirectBackOnError: true }),
    nextOfKinController.submitManualEditAddress({
      addressLocation: AddressLocation.no_fixed_address,
      auditAction: PostAction.EditNextOfKinAddressNoFixedAddressManual,
    }),
  )

  get(
    '/add-uk-next-of-kin-address',
    ...commonMiddleware,
    nextOfKinController.displayManualEditAddress({
      addressLocation: AddressLocation.uk,
      pageTitlePrefix: 'Add UK address for contact',
      formTitlePrefix: 'Add a UK address',
      auditPage: Page.EditNextOfKinAddressUkManual,
    }),
  )
  post(
    '/add-uk-next-of-kin-address',
    ...commonMiddleware,
    validationMiddleware([addressValidator], { redirectBackOnError: true }),
    nextOfKinController.submitManualEditAddress({
      addressLocation: AddressLocation.uk,
      auditAction: PostAction.EditNextOfKinAddressUkManual,
    }),
  )

  get(
    '/add-next-of-kin-overseas-address',
    ...commonMiddleware,
    nextOfKinController.displayManualEditAddress({
      addressLocation: AddressLocation.overseas,
      pageTitlePrefix: 'Add overseas address for contact',
      formTitlePrefix: 'Add an overseas address',
      auditPage: Page.EditNextOfKinAddressOverseasManual,
    }),
  )
  post(
    '/add-next-of-kin-overseas-address',
    ...commonMiddleware,
    validationMiddleware([addressValidator], { redirectBackOnError: true }),
    nextOfKinController.submitManualEditAddress({
      addressLocation: AddressLocation.overseas,
      auditAction: PostAction.EditNextOfKinAddressOverseasManual,
    }),
  )

  get('/confirm-next-of-kin-address', ...commonMiddleware, nextOfKinController.displayConfirmAddress())
  post('/confirm-next-of-kin-address', ...commonMiddleware, nextOfKinController.submitConfirmAddress())

  return router
}
