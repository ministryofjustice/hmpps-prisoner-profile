import { RequestHandler, Router } from 'express'
import { getRequest, postRequest } from './routerUtils'
import { Services } from '../services'
import AliasController from '../controllers/aliasController'

export default function aliasRouter(services: Services, editProfileChecks: () => RequestHandler): Router {
  const router = Router({ mergeParams: true })
  const get = getRequest(router)
  const post = postRequest(router)

  const aliasController = new AliasController(services.auditService)

  get('/change-name', editProfileChecks(), aliasController.displayChangeNameDecision())
  post('/change-name', editProfileChecks(), aliasController.submitChangeNameDecision())

  return router
}
