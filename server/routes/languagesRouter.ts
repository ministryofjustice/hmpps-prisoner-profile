import { RequestHandler, Router } from 'express'
import { getRequest, postRequest } from './routerUtils'
import { Services } from '../services'
import LanguagesController from '../controllers/languagesController'

export default function languagesRouter(services: Services, editProfileChecks: () => RequestHandler): Router {
  const router = Router({ mergeParams: true })
  const get = getRequest(router)
  const post = postRequest(router)

  const languagesController = new LanguagesController(services.languagesService, services.auditService)

  get('/main-language', editProfileChecks(), languagesController.displayUpdateMainLanguage())
  post('/main-language', editProfileChecks(), languagesController.submitUpdateMainLanguage())

  // get('/other-languages', editProfileChecks(), languagesController.displayUpdateMainLanguage())
  // post('/other-languages', editProfileChecks(), languagesController.submitUpdateMainLanguage())

  return router
}
