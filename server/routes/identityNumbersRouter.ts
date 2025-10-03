import { RequestHandler, Router } from 'express'
import { CorePersonRecordPermission, prisonerPermissionsGuard } from '@ministryofjustice/hmpps-prison-permissions-lib'
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
  const { prisonPermissionsService } = services

  const identityNumberRoutes = Object.values(IdentifierMappings).map(mapping => `/${mapping.editPageUrl}/:compositeId`)

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
  router.get('/justice-id-numbers', ...commonMiddleware, identityNumbersController.justiceIdNumbers().edit)
  router.post(
    '/justice-id-numbers',
    ...commonMiddleware,
    validationMiddleware([addIdentityNumbersValidator], {
      redirectBackOnError: true,
    }),
    identityNumbersController.justiceIdNumbers().submit,
  )

  // Add personal ID numbers
  router.get('/personal-id-numbers', ...commonMiddleware, identityNumbersController.personalIdNumbers().edit)
  router.post(
    '/personal-id-numbers',
    ...commonMiddleware,
    validationMiddleware([addIdentityNumbersValidator], {
      redirectBackOnError: true,
    }),
    identityNumbersController.personalIdNumbers().submit,
  )

  // Add Home Office ID numbers
  router.get('/home-office-id-numbers', ...commonMiddleware, identityNumbersController.homeOfficeIdNumbers().edit)
  router.post(
    '/home-office-id-numbers',
    ...commonMiddleware,
    validationMiddleware([addIdentityNumbersValidator], {
      redirectBackOnError: true,
    }),
    identityNumbersController.homeOfficeIdNumbers().submit,
  )

  // Edit individual existing ID numbers
  router.get(identityNumberRoutes, ...commonMiddleware, identityNumbersController.idNumber().edit)
  router.post(
    identityNumberRoutes,
    ...commonMiddleware,
    validationMiddleware([editIdentityNumberValidator], {
      redirectBackOnError: true,
    }),
    identityNumbersController.idNumber().submit,
  )

  return router
}
