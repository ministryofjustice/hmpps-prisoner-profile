import { RequestHandler, Router } from 'express'
import { Services } from '../services'
import { getRequest, postRequest } from './routerUtils'
import AddressEditController from '../controllers/addressEditController'
import validationMiddleware from '../middleware/validationMiddleware'
import { notEmptyValidator } from '../validators/general/notEmptyValidator'

export default function addressEditRouter(services: Services, editProfileChecks: () => RequestHandler): Router {
  const router = Router({ mergeParams: true })
  const get = getRequest(router)
  const post = postRequest(router)

  const addressEditController = new AddressEditController(
    services.addressService,
    services.ephemeralDataService,
    services.auditService,
  )

  get('/where-is-address', editProfileChecks(), addressEditController.displayWhereIsTheAddress())
  post(
    '/where-is-address',
    editProfileChecks(),
    validationMiddleware(
      [notEmptyValidator({ fieldName: 'radioField', href: '#radio', errorText: 'Select where the address is' })],
      { redirectBackOnError: true, useReq: true },
    ),
    addressEditController.submitWhereIsTheAddress(),
  )

  get('/find-uk-address', editProfileChecks(), addressEditController.displayFindUkAddress())
  post(
    '/find-uk-address',
    editProfileChecks(),
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

  get('/confirm-address', editProfileChecks(), addressEditController.displayConfirmAddress())

  get('/primary-or-postal-address', editProfileChecks(), addressEditController.displayPrimaryOrPostalAddress())
  post(
    '/primary-or-postal-address',
    editProfileChecks(),
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

  return router
}
