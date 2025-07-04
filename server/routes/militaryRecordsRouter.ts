import { Router } from 'express'
import { getRequest, postRequest } from './routerUtils'
import { Services } from '../services'
import MilitaryRecordsController from '../controllers/militaryRecordsController'
import { militaryServiceInformationValidator } from '../validators/personal/militaryServiceInformationValidator'
import validationMiddleware from '../middleware/validationMiddleware'
import { dischargeDetailsValidator } from '../validators/personal/dischargeDetailsValidator'

export default function militaryRecordsRouter(services: Services): Router {
  const router = Router({ mergeParams: true })
  const get = getRequest(router)
  const post = postRequest(router)

  const militaryRecordsController = new MilitaryRecordsController(
    services.militaryRecordsService,
    services.auditService,
  )

  // Create Military Service Information
  get('/military-service-information', militaryRecordsController.displayMilitaryServiceInformation())
  post(
    '/military-service-information',
    validationMiddleware([militaryServiceInformationValidator], {
      redirectBackOnError: true,
    }),
    militaryRecordsController.postMilitaryServiceInformation(),
  )

  // Update Military Service Information
  get('/military-service-information/:militarySeq', militaryRecordsController.displayMilitaryServiceInformation())
  post(
    '/military-service-information/:militarySeq',
    validationMiddleware([militaryServiceInformationValidator], {
      redirectBackOnError: true,
    }),
    militaryRecordsController.postMilitaryServiceInformation(),
  )

  // Update Conflicts
  get('/conflicts/:militarySeq', militaryRecordsController.displayConflicts())
  post('/conflicts/:militarySeq', militaryRecordsController.postConflicts())

  // Update Disciplinary Action
  get('/disciplinary-action/:militarySeq', militaryRecordsController.displayDisciplinaryAction())
  post('/disciplinary-action/:militarySeq', militaryRecordsController.postDisciplinaryAction())

  // Update Discharge Details
  get('/discharge-details/:militarySeq', militaryRecordsController.displayDischargeDetails())
  post(
    '/discharge-details/:militarySeq',
    validationMiddleware([dischargeDetailsValidator], {
      redirectBackOnError: true,
    }),
    militaryRecordsController.postDischargeDetails(),
  )

  return router
}
