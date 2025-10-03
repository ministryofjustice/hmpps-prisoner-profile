import { RequestHandler, Router } from 'express'
import { CorePersonRecordPermission, prisonerPermissionsGuard } from '@ministryofjustice/hmpps-prison-permissions-lib'
import { Services } from '../services'
import AliasController from '../controllers/aliasController'
import validationMiddleware from '../middleware/validationMiddleware'
import { nameValidator } from '../validators/personal/nameValidator'
import { featureFlagGuard } from '../middleware/featureFlagGuard'
import { editProfileEnabled } from '../utils/featureToggles'
import { radioFieldValidator } from '../validators/personal/radioFieldValidator'
import { dateOfBirthValidator } from '../validators/personal/dateOfBirthValidator'
import { parameterGuard } from '../middleware/parameterGuard'

export default function aliasRouter(services: Services): Router {
  const router = Router({ mergeParams: true })
  const { prisonPermissionsService } = services

  const ethnicGroups = ['white', 'mixed', 'asian', 'black', 'other']

  const aliasController = new AliasController(
    services.aliasService,
    services.referenceDataService,
    services.auditService,
  )

  const commonMiddleware: RequestHandler[] = [
    featureFlagGuard('Profile Edit', editProfileEnabled),
    prisonerPermissionsGuard(prisonPermissionsService, {
      requestDependentOn: [CorePersonRecordPermission.edit_name_and_aliases],
    }),
  ]

  router.get('/change-name', ...commonMiddleware, aliasController.displayChangeNamePurpose())
  router.post('/change-name', ...commonMiddleware, aliasController.submitChangeNamePurpose())

  router.get('/date-of-birth', ...commonMiddleware, aliasController.displayChangeDateOfBirth())
  router.post(
    '/date-of-birth',
    ...commonMiddleware,
    validationMiddleware(
      [
        dateOfBirthValidator({
          namePrefix: 'dateOfBirth',
          label: 'Date of birth',
          missingText: 'Enter this person’s date of birth',
        }),
      ],
      {
        redirectBackOnError: true,
      },
    ),
    aliasController.submitChangeDateOfBirth(),
  )

  router.get('/ethnic-group', ...commonMiddleware, aliasController.displayChangeEthnicGroup())
  router.post(
    '/ethnic-group',
    ...commonMiddleware,
    validationMiddleware(
      [radioFieldValidator({ fieldName: 'radioField', href: 'radio', fieldDisplayName: 'an ethnic group' })],
      {
        redirectBackOnError: true,
      },
    ),
    aliasController.submitChangeEthnicGroup(),
  )
  router.get(
    `/ethnic-group/:group`,
    parameterGuard('group', ethnicGroups),
    ...commonMiddleware,
    aliasController.displayChangeEthnicBackground(),
  )
  router.post(
    `/ethnic-group/:group`,
    parameterGuard('group', ethnicGroups),
    ...commonMiddleware,
    aliasController.submitChangeEthnicBackground(),
  )

  router.get('/enter-corrected-name', ...commonMiddleware, aliasController.displayChangeNameCorrection())
  router.post(
    '/enter-corrected-name',
    ...commonMiddleware,
    validationMiddleware([nameValidator], { redirectBackOnError: true }),
    aliasController.submitChangeNameCorrection(),
  )

  router.get('/enter-new-name', ...commonMiddleware, aliasController.displayChangeNameLegal())
  router.post(
    '/enter-new-name',
    ...commonMiddleware,
    validationMiddleware([nameValidator], { redirectBackOnError: true }),
    aliasController.submitChangeNameLegal(),
  )

  router.get('/enter-alias-details', ...commonMiddleware, aliasController.displayAddNewAlias())
  router.post(
    '/enter-alias-details',
    ...commonMiddleware,
    validationMiddleware(
      [
        nameValidator,
        dateOfBirthValidator({
          namePrefix: 'dateOfBirth',
          label: 'Date of birth',
          missingText: 'Enter this person’s date of birth',
        }),
      ],
      {
        redirectBackOnError: true,
      },
    ),
    aliasController.submitAddNewAlias(),
  )

  return router
}
