import { Router } from 'express'
import { PrisonerBasePermission, prisonerPermissionsGuard } from '@ministryofjustice/hmpps-prison-permissions-lib'
import { Services } from '../services'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { Page } from '../services/auditService'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import { VisitsController } from '../controllers/visitsController'

export default function visitsRouter(services: Services): Router {
  const router = Router()
  const basePath = '/prisoner/:prisonerNumber'
  const { prisonPermissionsService } = services

  const visitsController = new VisitsController(services.visitsService)

  router.get(
    `${basePath}/visits-details`,
    auditPageAccessAttempt({ services, page: Page.VisitDetails }),
    getPrisonerData(services, { minimal: true }),
    prisonerPermissionsGuard(prisonPermissionsService, { requestDependentOn: [PrisonerBasePermission.read] }),
    visitsController.visitsDetails(),
  )

  return router
}
