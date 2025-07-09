import { RequestHandler, Router } from 'express'
import { CorePersonRecordPermission, prisonerPermissionsGuard } from '@ministryofjustice/hmpps-prison-permissions-lib'
import { Services } from '../services'
import { getRequest, postRequest } from './routerUtils'
import AddressEditController from '../controllers/addressEditController'
import validationMiddleware from '../middleware/validationMiddleware'
import { notEmptyValidator } from '../validators/general/notEmptyValidator'
import { Page, PostAction } from '../services/auditService'
import { addressValidator } from '../validators/personal/addressValidator'
import { AddressLocation } from '../services/mappers/addressMapper'
import { featureFlagGuard } from '../middleware/featureFlagGuard'
import { editProfileEnabled } from '../utils/featureToggles'

export default function addressEditRouter(services: Services): Router {
  const router = Router({ mergeParams: true })
  const get = getRequest(router)
  const post = postRequest(router)
  const { prisonPermissionsService } = services

  const addressEditController = new AddressEditController(
    services.addressService,
    services.ephemeralDataService,
    services.auditService,
  )

  const commonMiddleware: RequestHandler[] = [
    featureFlagGuard('Profile Edit', editProfileEnabled),
    prisonerPermissionsGuard(prisonPermissionsService, {
      requestDependentOn: [CorePersonRecordPermission.edit_address],
    }),
  ]

  get('/where-is-address', ...commonMiddleware, addressEditController.displayWhereIsTheAddress())
  post(
    '/where-is-address',
    ...commonMiddleware,
    validationMiddleware(
      [notEmptyValidator({ fieldName: 'radioField', href: '#radio', errorText: 'Select where the address is' })],
      { redirectBackOnError: true, useReq: true },
    ),
    addressEditController.submitWhereIsTheAddress(),
  )

  get('/find-uk-address', ...commonMiddleware, addressEditController.displayFindUkAddress())
  post(
    '/find-uk-address',
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
    addressEditController.submitFindUkAddress(),
  )

  get('/confirm-address', ...commonMiddleware, addressEditController.displayConfirmAddress())

  get('/primary-or-postal-address', ...commonMiddleware, addressEditController.displayPrimaryOrPostalAddress())
  post(
    '/primary-or-postal-address',
    ...commonMiddleware,
    validationMiddleware(
      [
        notEmptyValidator({
          fieldName: 'primaryOrPostal',
          errorText: 'Select if this is the primary or postal address',
          href: '#primaryOrPostal',
        }),
      ],
      { redirectBackOnError: true, useReq: true },
    ),
    addressEditController.submitPrimaryOrPostalAddress(),
  )

  get(
    '/add-uk-address',
    ...commonMiddleware,
    addressEditController.displayManualEditAddress({
      addressLocation: AddressLocation.uk,
      pageTitlePrefix: 'Add a UK address - Prisoner personal details',
      formTitlePrefix: 'Add a UK address',
      auditPage: Page.EditAddressUkManual,
    }),
  )
  post(
    '/add-uk-address',
    ...commonMiddleware,
    validationMiddleware([addressValidator], { redirectBackOnError: true }),
    addressEditController.submitManualEditAddress({
      addressLocation: AddressLocation.uk,
      auditAction: PostAction.EditAddressUkManual,
    }),
  )

  get(
    '/add-overseas-address',
    ...commonMiddleware,
    addressEditController.displayManualEditAddress({
      addressLocation: AddressLocation.overseas,
      pageTitlePrefix: 'Add an overseas address',
      formTitlePrefix: 'Add an overseas address',
      auditPage: Page.EditAddressOverseasManual,
    }),
  )
  post(
    '/add-overseas-address',
    ...commonMiddleware,
    validationMiddleware([addressValidator], { redirectBackOnError: true }),
    addressEditController.submitManualEditAddress({
      addressLocation: AddressLocation.overseas,
      auditAction: PostAction.EditAddressOverseasManual,
    }),
  )

  get(
    '/add-uk-no-fixed-address',
    ...commonMiddleware,
    addressEditController.displayManualEditAddress({
      addressLocation: AddressLocation.no_fixed_address,
      pageTitlePrefix: 'Add a UK no fixed address',
      formTitlePrefix: 'Add a UK address',
      auditPage: Page.EditAddressNoFixedAddressManual,
    }),
  )
  post(
    '/add-uk-no-fixed-address',
    ...commonMiddleware,
    validationMiddleware([addressValidator], { redirectBackOnError: true }),
    addressEditController.submitManualEditAddress({
      addressLocation: AddressLocation.no_fixed_address,
      auditAction: PostAction.EditAddressNoFixedAddressManual,
    }),
  )

  return router
}
