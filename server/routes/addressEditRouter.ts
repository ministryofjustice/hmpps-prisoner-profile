import { Router } from 'express'
import { Services } from '../services'
import { getRequest, postRequest } from './routerUtils'
import AddressEditController from '../controllers/addressEditController'
import validationMiddleware from '../middleware/validationMiddleware'
import { notEmptyValidator } from '../validators/general/notEmptyValidator'
import { Page, PostAction } from '../services/auditService'
import { addressValidator } from '../validators/personal/addressValidator'
import { AddressLocation } from '../services/mappers/addressMapper'

export default function addressEditRouter(services: Services): Router {
  const router = Router({ mergeParams: true })
  const get = getRequest(router)
  const post = postRequest(router)

  const addressEditController = new AddressEditController(
    services.addressService,
    services.ephemeralDataService,
    services.auditService,
  )

  get('/where-is-address', addressEditController.displayWhereIsTheAddress())
  post(
    '/where-is-address',
    validationMiddleware(
      [notEmptyValidator({ fieldName: 'radioField', href: '#radio', errorText: 'Select where the address is' })],
      { redirectBackOnError: true, useReq: true },
    ),
    addressEditController.submitWhereIsTheAddress(),
  )

  get('/find-uk-address', addressEditController.displayFindUkAddress())
  post(
    '/find-uk-address',
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

  get('/confirm-address', addressEditController.displayConfirmAddress())

  get('/primary-or-postal-address', addressEditController.displayPrimaryOrPostalAddress())
  post(
    '/primary-or-postal-address',
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
    addressEditController.displayManualEditAddress({
      addressLocation: AddressLocation.uk,
      pageTitlePrefix: 'Add a UK address - Prisoner personal details',
      formTitlePrefix: 'Add a UK address',
      auditPage: Page.EditAddressUkManual,
    }),
  )

  post(
    '/add-uk-address',
    validationMiddleware([addressValidator], { redirectBackOnError: true }),
    addressEditController.submitManualEditAddress({
      addressLocation: AddressLocation.uk,
      auditAction: PostAction.EditAddressUkManual,
    }),
  )

  get(
    '/add-overseas-address',
    addressEditController.displayManualEditAddress({
      addressLocation: AddressLocation.overseas,
      pageTitlePrefix: 'Add an overseas address',
      formTitlePrefix: 'Add an overseas address',
      auditPage: Page.EditAddressOverseasManual,
    }),
  )

  post(
    '/add-overseas-address',
    validationMiddleware([addressValidator], { redirectBackOnError: true }),
    addressEditController.submitManualEditAddress({
      addressLocation: AddressLocation.overseas,
      auditAction: PostAction.EditAddressOverseasManual,
    }),
  )

  get(
    '/add-uk-no-fixed-address',
    addressEditController.displayManualEditAddress({
      addressLocation: AddressLocation.no_fixed_address,
      pageTitlePrefix: 'Add a UK no fixed address',
      formTitlePrefix: 'Add a UK address',
      auditPage: Page.EditAddressNoFixedAddressManual,
    }),
  )

  post(
    '/add-uk-no-fixed-address',
    validationMiddleware([addressValidator], { redirectBackOnError: true }),
    addressEditController.submitManualEditAddress({
      addressLocation: AddressLocation.no_fixed_address,
      auditAction: PostAction.EditAddressNoFixedAddressManual,
    }),
  )

  return router
}
