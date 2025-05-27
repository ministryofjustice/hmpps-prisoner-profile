import { RequestHandler, Router } from 'express'
import { getRequest, postRequest } from './routerUtils'
import { Services } from '../services'
import NextOfKinController from '../controllers/nextOfKinController'
import validationMiddleware from '../middleware/validationMiddleware'
import { nextOfKinValidator } from '../validators/personal/nextOfKinValidator'

export default function nextOfKinRouter(services: Services, editProfileChecks: () => RequestHandler): Router {
  const router = Router({ mergeParams: true })
  const get = getRequest(router)
  const post = postRequest(router)

  const nextOfKinController = new NextOfKinController(services.nextOfKinService, services.auditService)

  get('/next-of-kin-emergency-contacts', editProfileChecks(), nextOfKinController.displayNextOfKinEmergencyContact())
  post(
    '/next-of-kin-emergency-contacts',
    editProfileChecks(),
    validationMiddleware([nextOfKinValidator], {
      redirectBackOnError: true,
    }),
    nextOfKinController.submitNextOfKinEmergencyContact(),
  )

  return router
}
