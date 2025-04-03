import { RequestHandler, Router } from 'express'
import { getRequest, postRequest } from './routerUtils'
import { Services } from '../services'
import AliasController from '../controllers/aliasController'
import validationMiddleware from '../middleware/validationMiddleware'
import { nameValidator } from '../validators/personal/nameValidator'
import { dateValidator } from '../validators/personal/dateValidator'

export default function aliasRouter(services: Services, editProfileChecks: () => RequestHandler): Router {
  const router = Router({ mergeParams: true })
  const get = getRequest(router)
  const post = postRequest(router)

  const aliasController = new AliasController(services.aliasService, services.auditService)

  get('/change-name', editProfileChecks(), aliasController.displayChangeNamePurpose())
  post('/change-name', editProfileChecks(), aliasController.submitChangeNamePurpose())

  get('/enter-corrected-name', editProfileChecks(), aliasController.displayChangeNameCorrection())
  post(
    '/enter-corrected-name',
    editProfileChecks(),
    validationMiddleware([nameValidator], { redirectBackOnError: true }),
    aliasController.submitChangeNameCorrection(),
  )

  get('/enter-new-name', editProfileChecks(), aliasController.displayChangeNameLegal())
  post(
    '/enter-new-name',
    editProfileChecks(),
    validationMiddleware([nameValidator], { redirectBackOnError: true }),
    aliasController.submitChangeNameLegal(),
  )

  get('/enter-alias-details', editProfileChecks(), aliasController.displayAddNewAlias())
  post(
    '/enter-alias-details',
    editProfileChecks(),
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
