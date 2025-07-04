import { Router } from 'express'
import { getRequest, postRequest } from './routerUtils'
import { Services } from '../services'
import AliasController from '../controllers/aliasController'
import validationMiddleware from '../middleware/validationMiddleware'
import { nameValidator } from '../validators/personal/nameValidator'
import { dateValidator } from '../validators/personal/dateValidator'

export default function aliasRouter(services: Services): Router {
  const router = Router({ mergeParams: true })
  const get = getRequest(router)
  const post = postRequest(router)

  const ethnicGroups = ['white', 'mixed', 'asian', 'black', 'other'].join('|')

  const aliasController = new AliasController(
    services.aliasService,
    services.referenceDataService,
    services.auditService,
  )

  get('/change-name', aliasController.displayChangeNamePurpose())
  post('/change-name', aliasController.submitChangeNamePurpose())

  get('/date-of-birth', aliasController.displayChangeDateOfBirth())
  post(
    '/date-of-birth',
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

  get('/ethnic-group', aliasController.displayChangeEthnicGroup())
  post('/ethnic-group', aliasController.submitChangeEthnicGroup())
  get(`/:group(${ethnicGroups})`, aliasController.displayChangeEthnicBackground())
  post(`/:group(${ethnicGroups})`, aliasController.submitChangeEthnicBackground())

  get('/enter-corrected-name', aliasController.displayChangeNameCorrection())
  post(
    '/enter-corrected-name',
    validationMiddleware([nameValidator], { redirectBackOnError: true }),
    aliasController.submitChangeNameCorrection(),
  )

  get('/enter-new-name', aliasController.displayChangeNameLegal())
  post(
    '/enter-new-name',
    validationMiddleware([nameValidator], { redirectBackOnError: true }),
    aliasController.submitChangeNameLegal(),
  )

  get('/enter-alias-details', aliasController.displayAddNewAlias())
  post(
    '/enter-alias-details',
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
