import { RequestHandler, Router } from 'express'
import { getRequest, postRequest } from './routerUtils'
import { Services } from '../services'
import validationMiddleware from '../middleware/validationMiddleware'
import IdentityNumbersController from '../controllers/identityNumbersController'
import {
  addIdentityNumbersValidator,
  editIdentityNumberValidator,
} from '../validators/personal/identityNumbersValidator'
import { IdentifierMappings } from '../data/constants/identifierMappings'

export default function identityNumbersRouter(services: Services, editProfileChecks: () => RequestHandler): Router {
  const router = Router({ mergeParams: true })
  const get = getRequest(router)
  const post = postRequest(router)

  const identityNumberRoutes = Object.values(IdentifierMappings)
    .map(mapping => mapping.editPageUrl)
    .join('|')

  const identityNumbersController = new IdentityNumbersController(
    services.identityNumbersService,
    services.auditService,
  )

  // Add justice ID numbers
  get('/justice-id-numbers', editProfileChecks(), identityNumbersController.justiceIdNumbers().edit)
  post(
    '/justice-id-numbers',
    editProfileChecks(),
    validationMiddleware([addIdentityNumbersValidator], {
      redirectBackOnError: true,
    }),
    identityNumbersController.justiceIdNumbers().submit,
  )

  // Add personal ID numbers
  get('/personal-id-numbers', editProfileChecks(), identityNumbersController.personalIdNumbers().edit)
  post(
    '/personal-id-numbers',
    editProfileChecks(),
    validationMiddleware([addIdentityNumbersValidator], {
      redirectBackOnError: true,
    }),
    identityNumbersController.personalIdNumbers().submit,
  )

  // Add Home Office ID numbers
  get('/home-office-id-numbers', editProfileChecks(), identityNumbersController.homeOfficeIdNumbers().edit)
  post(
    '/home-office-id-numbers',
    editProfileChecks(),
    validationMiddleware([addIdentityNumbersValidator], {
      redirectBackOnError: true,
    }),
    identityNumbersController.homeOfficeIdNumbers().submit,
  )

  // Edit individual existing ID numbers
  get(
    `/:identifier(${identityNumberRoutes})/:compositeId`,
    editProfileChecks(),
    identityNumbersController.idNumber().edit,
  )
  post(
    `/:identifier(${identityNumberRoutes})/:compositeId`,
    editProfileChecks(),
    validationMiddleware([editIdentityNumberValidator], {
      redirectBackOnError: true,
    }),
    identityNumbersController.idNumber().submit,
  )

  return router
}
