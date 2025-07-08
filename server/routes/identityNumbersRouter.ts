import { RequestHandler, Router } from 'express'
import { CorePersonRecordPermission, prisonerPermissionsGuard } from '@ministryofjustice/hmpps-prison-permissions-lib'
import { getRequest, postRequest } from './routerUtils'
import { Services } from '../services'
import validationMiddleware from '../middleware/validationMiddleware'
import IdentityNumbersController from '../controllers/identityNumbersController'
import {
  addIdentityNumbersValidator,
  editIdentityNumberValidator,
} from '../validators/personal/identityNumbersValidator'
import { IdentifierMappings } from '../data/constants/identifierMappings'
import { featureFlagGuard } from '../middleware/featureFlagGuard'
import { editProfileEnabled } from '../utils/featureToggles'

export default function identityNumbersRouter(services: Services): Router {
  const router = Router({ mergeParams: true })
  const get = getRequest(router)
  const post = postRequest(router)
  const { prisonPermissionsService } = services

  const identityNumberRoutes = Object.values(IdentifierMappings)
    .map(mapping => mapping.editPageUrl)
    .join('|')

  const identityNumbersController = new IdentityNumbersController(
    services.identityNumbersService,
    services.auditService,
  )

  const commonMiddleware: RequestHandler[] = [
    featureFlagGuard('Profile Edit', editProfileEnabled),
    prisonerPermissionsGuard(prisonPermissionsService, {
      requestDependentOn: [CorePersonRecordPermission.edit_identifiers],
    }),
  ]

  // Add justice ID numbers
  get('/justice-id-numbers', ...commonMiddleware, identityNumbersController.justiceIdNumbers().edit)
  post(
    '/justice-id-numbers',
    ...commonMiddleware,
    validationMiddleware([addIdentityNumbersValidator], {
      redirectBackOnError: true,
    }),
    identityNumbersController.justiceIdNumbers().submit,
  )

  // Add personal ID numbers
  get('/personal-id-numbers', ...commonMiddleware, identityNumbersController.personalIdNumbers().edit)
  post(
    '/personal-id-numbers',
    ...commonMiddleware,
    validationMiddleware([addIdentityNumbersValidator], {
      redirectBackOnError: true,
    }),
    identityNumbersController.personalIdNumbers().submit,
  )

  // Add Home Office ID numbers
  get('/home-office-id-numbers', ...commonMiddleware, identityNumbersController.homeOfficeIdNumbers().edit)
  post(
    '/home-office-id-numbers',
    ...commonMiddleware,
    validationMiddleware([addIdentityNumbersValidator], {
      redirectBackOnError: true,
    }),
    identityNumbersController.homeOfficeIdNumbers().submit,
  )

  // Edit individual existing ID numbers
  get(
    `/:identifier(${identityNumberRoutes})/:compositeId`,
    ...commonMiddleware,
    identityNumbersController.idNumber().edit,
  )
  post(
    `/:identifier(${identityNumberRoutes})/:compositeId`,
    ...commonMiddleware,
    validationMiddleware([editIdentityNumberValidator], {
      redirectBackOnError: true,
    }),
    identityNumbersController.idNumber().submit,
  )

  return router
}
