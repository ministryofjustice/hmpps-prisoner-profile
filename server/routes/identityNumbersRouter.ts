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
  get('/justice-id-numbers', editProfileChecks(), identityNumbersController.addJusticeIdNumbers())
  post(
    '/justice-id-numbers',
    editProfileChecks(),
    validationMiddleware([identityNumbersValidator], {
      redirectBackOnError: true,
    }),
    identityNumbersController.postJusticeIdNumbers(),
  )

  return router
}
