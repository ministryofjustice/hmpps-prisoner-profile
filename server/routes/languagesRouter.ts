import { Router } from 'express'
import { getRequest, postRequest } from './routerUtils'
import { Services } from '../services'
import LanguagesController from '../controllers/languagesController'

export default function languagesRouter(services: Services): Router {
  const router = Router({ mergeParams: true })
  const get = getRequest(router)
  const post = postRequest(router)

  const languagesController = new LanguagesController(services.languagesService, services.auditService)

  get('/main-language', languagesController.displayUpdateMainLanguage())
  post('/main-language', languagesController.submitUpdateMainLanguage())

  // get('/other-languages', languagesController.displayUpdateMainLanguage())
  // post('/other-languages', languagesController.submitUpdateMainLanguage())

  return router
}
