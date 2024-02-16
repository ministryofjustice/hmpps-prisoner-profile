import { Router } from 'express'
import { Services } from '../services'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import checkPrisonerInCaseload from '../middleware/checkPrisonerInCaseloadMiddleware'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { Page } from '../services/auditService'
import { getRequest } from './routerUtils'
import LocationDetailsController from '../controllers/locationDetailsController'

export default function locationDetailsRouter(services: Services): Router {
  const router = Router()
  const get = getRequest(router)

  const prisonerLocationDetailsController = new LocationDetailsController(
    services.prisonerLocationDetailsPageService,
    services.auditService,
  )

  get(
    '/prisoner/:prisonerNumber/location-details',
    auditPageAccessAttempt({ services, page: Page.PrisonerCellHistory }),
    getPrisonerData(services),
    checkPrisonerInCaseload(services, { allowInactive: true }),
    async (req, res, next) => {
      const prisonerData = req.middleware?.prisonerData
      return prisonerLocationDetailsController.displayLocationDetails(req, res, prisonerData)
    },
  )

  return router
}
