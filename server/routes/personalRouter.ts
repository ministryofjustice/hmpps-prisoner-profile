import { Router } from 'express'
import { getRequest, postRequest } from './routerUtils'
import PersonalController from '../controllers/personalController'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { Page } from '../services/auditService'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import checkPrisonerInCaseload from '../middleware/checkPrisonerInCaseloadMiddleware'
import { Services } from '../services'
import permissionsGuard from '../middleware/permissionsGuard'

export default function personalRouter(services: Services): Router {
  const router = Router()
  const basePath = '/prisoner/:prisonerNumber/personal'
  const get = getRequest(router)
  const post = postRequest(router)

  const personalController = new PersonalController(
    services.personalPageService,
    services.careNeedsService,
    services.auditService,
  )

  get(
    basePath,
    auditPageAccessAttempt({ services, page: Page.Personal }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getOverviewPermissions),
    personalController.displayPersonalPage(),
  )

  // TODO: Disable these routes via a feature toggle
  const enableEditRoutes = false
  // Edit routes

  if (enableEditRoutes) {
    // Height - Metric
    get(
      `${basePath}/edit/height`,
      // TODO: Add role check here
      getPrisonerData(services),
      checkPrisonerInCaseload(),
      personalController.height().metric.edit,
    )

    post(
      `${basePath}/edit/height`,
      // TODO: Add role check here
      getPrisonerData(services),
      checkPrisonerInCaseload(),
      personalController.height().metric.submit,
    )

    // Height - Imperial

    get(
      `${basePath}/edit/height/imperial`,
      // TODO: Add role check here
      getPrisonerData(services),
      checkPrisonerInCaseload(),
      personalController.height().imperial.edit,
    )

    post(
      `${basePath}/edit/height/imperial`,
      // TODO: Add role check here
      getPrisonerData(services),
      checkPrisonerInCaseload(),
      personalController.height().imperial.submit,
    )
  }

  return router
}
