import { RequestHandler, Router } from 'express'
import {
  PersonCommunicationNeedsPermission,
  prisonerPermissionsGuard,
} from '@ministryofjustice/hmpps-prison-permissions-lib'
import { Services } from '../services'
import LanguagesController from '../controllers/languagesController'
import { featureFlagGuard } from '../middleware/featureFlagGuard'
import { editProfileEnabled } from '../utils/featureToggles'
import validationMiddleware from '../middleware/validationMiddleware'
import { mainLanguageValidator } from '../validators/personal/mainLanguageValidator'
import { otherLanguageValidator } from '../validators/personal/otherLanguageValidator'

export default function languagesRouter(services: Services): Router {
  const router = Router({ mergeParams: true })
  const { prisonPermissionsService } = services

  const languagesController = new LanguagesController(services.languagesService, services.auditService)
  const commonMiddleware: RequestHandler[] = [
    featureFlagGuard('Profile Edit', editProfileEnabled),
    prisonerPermissionsGuard(prisonPermissionsService, {
      requestDependentOn: [PersonCommunicationNeedsPermission.edit_language],
    }),
  ]

  router.get('/main-language', ...commonMiddleware, languagesController.displayUpdateMainLanguage())
  router.post(
    '/main-language',
    ...commonMiddleware,
    validationMiddleware([mainLanguageValidator], { redirectBackOnError: true }),
    languagesController.submitUpdateMainLanguage(),
  )

  router.get('/other-languages', ...commonMiddleware, languagesController.displayUpdateOtherLanguages())
  router.post(
    '/other-languages',
    ...commonMiddleware,
    validationMiddleware([otherLanguageValidator], { redirectBackOnError: true }),
    languagesController.submitUpdateOtherLanguages(),
  )

  router.get('/other-languages/:languageCode', ...commonMiddleware, languagesController.displayUpdateOtherLanguages())
  router.post(
    '/other-languages/:languageCode',
    ...commonMiddleware,
    validationMiddleware([otherLanguageValidator], { redirectBackOnError: true }),
    languagesController.submitUpdateOtherLanguages(),
  )

  return router
}
