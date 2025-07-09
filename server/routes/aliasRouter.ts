import { RequestHandler, Router } from 'express'
import { CorePersonRecordPermission, prisonerPermissionsGuard } from '@ministryofjustice/hmpps-prison-permissions-lib'
import { getRequest, postRequest } from './routerUtils'
import { Services } from '../services'
import AliasController from '../controllers/aliasController'
import validationMiddleware from '../middleware/validationMiddleware'
import { nameValidator } from '../validators/personal/nameValidator'
import { dateValidator } from '../validators/personal/dateValidator'
import { featureFlagGuard } from '../middleware/featureFlagGuard'
import { editProfileEnabled } from '../utils/featureToggles'
import { radioFieldValidator } from '../validators/personal/radioFieldValidator'

export default function aliasRouter(services: Services): Router {
  const router = Router({ mergeParams: true })
  const get = getRequest(router)
  const post = postRequest(router)
  const { prisonPermissionsService } = services

  const ethnicGroups = ['white', 'mixed', 'asian', 'black', 'other'].join('|')

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

  get('/change-name', ...commonMiddleware, aliasController.displayChangeNamePurpose())
  post('/change-name', ...commonMiddleware, aliasController.submitChangeNamePurpose())

  get('/date-of-birth', ...commonMiddleware, aliasController.displayChangeDateOfBirth())
  post(
    '/date-of-birth',
    ...commonMiddleware,
    validationMiddleware(
      [
        dateValidator({
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

  get('/ethnic-group', ...commonMiddleware, aliasController.displayChangeEthnicGroup())
  post(
    '/ethnic-group',
    ...commonMiddleware,
    validationMiddleware([radioFieldValidator({ fieldName: 'radioField', fieldDisplayName: 'an ethnic group' })], {
      redirectBackOnError: true,
    }),
    aliasController.submitChangeEthnicGroup(),
  )
  get(`/:group(${ethnicGroups})`, ...commonMiddleware, aliasController.displayChangeEthnicBackground())
  post(`/:group(${ethnicGroups})`, ...commonMiddleware, aliasController.submitChangeEthnicBackground())

  get('/enter-corrected-name', ...commonMiddleware, aliasController.displayChangeNameCorrection())
  post(
    '/enter-corrected-name',
    ...commonMiddleware,
    validationMiddleware([nameValidator], { redirectBackOnError: true }),
    aliasController.submitChangeNameCorrection(),
  )

  get('/enter-new-name', ...commonMiddleware, aliasController.displayChangeNameLegal())
  post(
    '/enter-new-name',
    ...commonMiddleware,
    validationMiddleware([nameValidator], { redirectBackOnError: true }),
    aliasController.submitChangeNameLegal(),
  )

  get('/enter-alias-details', ...commonMiddleware, aliasController.displayAddNewAlias())
  post(
    '/enter-alias-details',
    ...commonMiddleware,
    validationMiddleware(
      [
        nameValidator,
        dateValidator({
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
