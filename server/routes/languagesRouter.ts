import { RequestHandler, Router } from 'express'
import {
  PersonCommunicationNeedsPermission,
  prisonerPermissionsGuard,
} from '@ministryofjustice/hmpps-prison-permissions-lib'
import { getRequest, postRequest } from './routerUtils'
import { Services } from '../services'
import LanguagesController from '../controllers/languagesController'
import { featureFlagGuard } from '../middleware/featureFlagGuard'
import { editProfileEnabled } from '../utils/featureToggles'

export default function languagesRouter(services: Services): Router {
  const router = Router({ mergeParams: true })
  const get = getRequest(router)
  const post = postRequest(router)
  const { prisonPermissionsService } = services

  const languagesController = new LanguagesController(services.languagesService, services.auditService)
  const commonMiddleware: RequestHandler[] = [
    featureFlagGuard('Profile Edit', editProfileEnabled),
    prisonerPermissionsGuard(prisonPermissionsService, {
      requestDependentOn: [PersonCommunicationNeedsPermission.edit_language],
    }),
  ]

  get('/main-language', ...commonMiddleware, languagesController.displayUpdateMainLanguage())
  post('/main-language', ...commonMiddleware, languagesController.submitUpdateMainLanguage())

  get('/other-languages', ...commonMiddleware, languagesController.displayUpdateOtherLanguages())
  post('/other-languages', ...commonMiddleware, languagesController.submitUpdateOtherLanguages())

  get('/other-languages/:languageCode', ...commonMiddleware, languagesController.displayUpdateOtherLanguages())
  post('/other-languages/:languageCode', ...commonMiddleware, languagesController.submitUpdateOtherLanguages())

  return router
}
