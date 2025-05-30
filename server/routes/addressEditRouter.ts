import { RequestHandler, Router } from 'express'
import { Services } from '../services'
import { getRequest, postRequest } from './routerUtils'
import AddressEditController from '../controllers/addressEditController'

export default function addressEditRouter(services: Services, editProfileChecks: () => RequestHandler): Router {
  const router = Router({ mergeParams: true })
  const get = getRequest(router)
  const post = postRequest(router)

  const addressEditController = new AddressEditController(services.auditService)

  get('/where-is-address', editProfileChecks(), addressEditController.displayWhereIsTheAddress())
  post('/where-is-address', editProfileChecks(), addressEditController.submitWhereIsTheAddress())

  return router
}
