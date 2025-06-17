import { RequestHandler, Router } from 'express'
import { getRequest, postRequest } from './routerUtils'
import { Services } from '../services'
import validationMiddleware from '../middleware/validationMiddleware'
import IdentityNumbersController from '../controllers/identityNumbersController'
import { identityNumbersValidator } from '../validators/personal/identityNumbersValidator'

export default function identityNumbersRouter(services: Services, editProfileChecks: () => RequestHandler): Router {
  const router = Router({ mergeParams: true })
  const get = getRequest(router)
  const post = postRequest(router)

  const identityNumbersController = new IdentityNumbersController(
    services.identityNumbersService,
    services.auditService,
  )

  // Add justice ID numbers
  get('/justice-id-numbers', editProfileChecks(), identityNumbersController.justiceIdNumbers().edit)
  post(
    '/justice-id-numbers',
    editProfileChecks(),
    validationMiddleware([identityNumbersValidator], {
      redirectBackOnError: true,
    }),
    identityNumbersController.justiceIdNumbers().submit,
  )

  // Add personal ID numbers
  get('/personal-id-numbers', editProfileChecks(), identityNumbersController.personalIdNumbers().edit)
  post(
    '/personal-id-numbers',
    editProfileChecks(),
    validationMiddleware([identityNumbersValidator], {
      redirectBackOnError: true,
    }),
    identityNumbersController.personalIdNumbers().submit,
  )

  // Add Home Office ID numbers
  get('/home-office-id-numbers', editProfileChecks(), identityNumbersController.homeOfficeIdNumbers().edit)
  post(
    '/home-office-id-numbers',
    editProfileChecks(),
    validationMiddleware([identityNumbersValidator], {
      redirectBackOnError: true,
    }),
    identityNumbersController.homeOfficeIdNumbers().submit,
  )

  // Add Home Office ID numbers
  get('/identity-number/:seqId', editProfileChecks(), identityNumbersController.idNumber().edit)
  post(
    '/identity-number/:seqId',
    editProfileChecks(),
    validationMiddleware([identityNumbersValidator], {
      redirectBackOnError: true,
    }),
    identityNumbersController.idNumber().submit,
  )

  return router
}
