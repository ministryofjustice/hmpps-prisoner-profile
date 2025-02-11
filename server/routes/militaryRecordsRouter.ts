import { NextFunction, Request, Response, Router } from 'express'
import { getRequest, postRequest } from './routerUtils'
import { Services } from '../services'
import MilitaryRecordsController from '../controllers/militaryRecordsController'
import { militaryServiceInformationValidator } from '../validators/personal/militaryServiceInformationValidator'
import validationMiddleware from '../middleware/validationMiddleware'
import { militaryHistoryEnabled } from '../utils/featureToggles'
import NotFoundError from '../utils/notFoundError'
import { HmppsStatusCode } from '../data/enums/hmppsStatusCode'
import { dischargeDetailsValidator } from '../validators/personal/dischargeDetailsValidator'

export default function militaryRecordsRouter(services: Services): Router {
  const router = Router({ mergeParams: true })
  const get = getRequest(router)
  const post = postRequest(router)

  const militaryRecordsController = new MilitaryRecordsController(
    services.militaryRecordsService,
    services.auditService,
  )

  // Feature flag check
  const militaryHistoryEnabledCheck = () => (req: Request, res: Response, next: NextFunction) => {
    if (militaryHistoryEnabled()) {
      return next()
    }
    return next(new NotFoundError('User cannot access military history routes', HmppsStatusCode.NOT_FOUND))
  }

  // Create Military Service Information
  get(
    '/military-service-information',
    militaryHistoryEnabledCheck(),
    militaryRecordsController.displayMilitaryServiceInformation(),
  )
  post(
    '/military-service-information',
    militaryHistoryEnabledCheck(),
    validationMiddleware([militaryServiceInformationValidator], {
      redirectBackOnError: true,
    }),
    militaryRecordsController.postMilitaryServiceInformation(),
  )

  // Update Military Service Information
  get(
    '/military-service-information/:militarySeq',
    militaryHistoryEnabledCheck(),
    militaryRecordsController.displayMilitaryServiceInformation(),
  )
  post(
    '/military-service-information/:militarySeq',
    militaryHistoryEnabledCheck(),
    validationMiddleware([militaryServiceInformationValidator], {
      redirectBackOnError: true,
    }),
    militaryRecordsController.postMilitaryServiceInformation(),
  )

  // Update Conflicts
  get('/conflicts/:militarySeq', militaryHistoryEnabledCheck(), militaryRecordsController.displayConflicts())
  post('/conflicts/:militarySeq', militaryHistoryEnabledCheck(), militaryRecordsController.postConflicts())

  // Update Disciplinary Action
  get(
    '/disciplinary-action/:militarySeq',
    militaryHistoryEnabledCheck(),
    militaryRecordsController.displayDisciplinaryAction(),
  )
  post(
    '/disciplinary-action/:militarySeq',
    militaryHistoryEnabledCheck(),
    militaryRecordsController.postDisciplinaryAction(),
  )

  // Update Discharge Details
  get(
    '/discharge-details/:militarySeq',
    militaryHistoryEnabledCheck(),
    militaryRecordsController.displayDischargeDetails(),
  )
  post(
    '/discharge-details/:militarySeq',
    militaryHistoryEnabledCheck(),
    validationMiddleware([dischargeDetailsValidator], {
      redirectBackOnError: true,
    }),
    militaryRecordsController.postDischargeDetails(),
  )

  return router
}
