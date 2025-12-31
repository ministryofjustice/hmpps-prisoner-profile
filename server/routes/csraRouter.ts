import { Router } from 'express'
import {
  prisonerPermissionsGuard,
  PrisonerSpecificRisksPermission,
} from '@ministryofjustice/hmpps-prison-permissions-lib'
import { Services } from '../services'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import CsraController from '../controllers/csraController'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { Page } from '../services/auditService'

export default function alertsRouter(services: Services): Router {
  const router = Router()
  const basePath = '/prisoner/:prisonerNumber'

  const { auditService, csraService, prisonPermissionsService } = services
  const csraController = new CsraController(csraService, auditService)

  router.get(
    `${basePath}/csra-history`,
    auditPageAccessAttempt({ services, page: Page.CsraHistory }),
    getPrisonerData(services, { minimal: true }),
    prisonerPermissionsGuard(prisonPermissionsService, {
      requestDependentOn: [PrisonerSpecificRisksPermission.read_csra_assessment_history],
    }),
    (req, res) => csraController.displayHistory(req, res),
  )

  router.get(
    `${basePath}/csra-review`,
    auditPageAccessAttempt({ services, page: Page.CsraReview }),
    getPrisonerData(services, { minimal: true }),
    prisonerPermissionsGuard(prisonPermissionsService, {
      requestDependentOn: [PrisonerSpecificRisksPermission.read_csra_assessment_history],
    }),
    (req, res) => csraController.displayReview(req, res),
  )

  return router
}
