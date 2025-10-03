import { Router } from 'express'
import { PrisonerBasePermission, prisonerPermissionsGuard } from '@ministryofjustice/hmpps-prison-permissions-lib'
import { Services } from '../services'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import GoalsController from '../controllers/goalsController'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { Page } from '../services/auditService'

export default function goalsRouter(services: Services): Router {
  const router = Router()
  const basePath = '/prisoner/:prisonerNumber'
  const { prisonPermissionsService } = services

  const goalsController = new GoalsController(services.workAndSkillsPageService, services.auditService)

  router.get(
    `${basePath}/vc2-goals`,
    auditPageAccessAttempt({ services, page: Page.VirtualCampusGoals }),
    getPrisonerData(services, { minimal: true }),
    prisonerPermissionsGuard(prisonPermissionsService, { requestDependentOn: [PrisonerBasePermission.read] }),
    (req, res) => goalsController.displayGoals(req, res),
  )

  return router
}
