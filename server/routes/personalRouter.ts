import { Router } from 'express'
import { PrisonerBasePermission, prisonerPermissionsGuard } from '@ministryofjustice/hmpps-prison-permissions-lib'
import { getRequest } from './routerUtils'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { Page } from '../services/auditService'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import { Services } from '../services'
import PersonalController from '../controllers/personal/personalController'

export const personalPageBasePath = '/prisoner/:prisonerNumber/personal'

export default function personalRouter(services: Services): Router {
  const router = Router()
  const get = getRequest(router)
  const { prisonPermissionsService } = services

  const personalController = new PersonalController(
    services.personalPageService,
    services.careNeedsService,
    services.auditService,
  )

  get(
    personalPageBasePath,
    auditPageAccessAttempt({ services, page: Page.Personal }),
    getPrisonerData(services),
    prisonerPermissionsGuard(prisonPermissionsService, { requestDependentOn: [PrisonerBasePermission.read] }),
    personalController.displayPersonalPage(),
  )

  return router
}
