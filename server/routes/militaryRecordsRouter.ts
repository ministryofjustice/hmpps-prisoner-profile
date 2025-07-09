import { RequestHandler, Router } from 'express'
import { CorePersonRecordPermission, prisonerPermissionsGuard } from '@ministryofjustice/hmpps-prison-permissions-lib'
import { getRequest, postRequest } from './routerUtils'
import { Services } from '../services'
import MilitaryRecordsController from '../controllers/militaryRecordsController'
import { militaryServiceInformationValidator } from '../validators/personal/militaryServiceInformationValidator'
import validationMiddleware from '../middleware/validationMiddleware'
import { dischargeDetailsValidator } from '../validators/personal/dischargeDetailsValidator'
import { featureFlagGuard } from '../middleware/featureFlagGuard'
import { militaryHistoryEnabled } from '../utils/featureToggles'

export default function militaryRecordsRouter(services: Services): Router {
  const router = Router({ mergeParams: true })
  const get = getRequest(router)
  const post = postRequest(router)
  const { prisonPermissionsService } = services

  const militaryRecordsController = new MilitaryRecordsController(
    services.militaryRecordsService,
    services.auditService,
  )

  const commonMiddleware: RequestHandler[] = [
    featureFlagGuard('Military History', militaryHistoryEnabled),
    prisonerPermissionsGuard(prisonPermissionsService, {
      requestDependentOn: [CorePersonRecordPermission.edit_military_history],
    }),
  ]

  // Create Military Service Information
  get(
    '/military-service-information',
    ...commonMiddleware,
    militaryRecordsController.displayMilitaryServiceInformation(),
  )
  post(
    '/military-service-information',
    ...commonMiddleware,
    validationMiddleware([militaryServiceInformationValidator], {
      redirectBackOnError: true,
    }),
    militaryRecordsController.postMilitaryServiceInformation(),
  )

  // Update Military Service Information
  get(
    '/military-service-information/:militarySeq',
    ...commonMiddleware,
    militaryRecordsController.displayMilitaryServiceInformation(),
  )
  post(
    '/military-service-information/:militarySeq',
    ...commonMiddleware,
    validationMiddleware([militaryServiceInformationValidator], {
      redirectBackOnError: true,
    }),
    militaryRecordsController.postMilitaryServiceInformation(),
  )

  // Update Conflicts
  get('/conflicts/:militarySeq', ...commonMiddleware, militaryRecordsController.displayConflicts())
  post('/conflicts/:militarySeq', ...commonMiddleware, militaryRecordsController.postConflicts())

  // Update Disciplinary Action
  get('/disciplinary-action/:militarySeq', ...commonMiddleware, militaryRecordsController.displayDisciplinaryAction())
  post('/disciplinary-action/:militarySeq', ...commonMiddleware, militaryRecordsController.postDisciplinaryAction())

  // Update Discharge Details
  get('/discharge-details/:militarySeq', ...commonMiddleware, militaryRecordsController.displayDischargeDetails())
  post(
    '/discharge-details/:militarySeq',
    ...commonMiddleware,
    validationMiddleware([dischargeDetailsValidator], {
      redirectBackOnError: true,
    }),
    militaryRecordsController.postDischargeDetails(),
  )

  return router
}
