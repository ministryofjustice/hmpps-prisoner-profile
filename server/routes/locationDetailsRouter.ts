import { Router } from 'express'
import { Services } from '../services'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { Page } from '../services/auditService'
import { getRequest } from './routerUtils'
import LocationDetailsController from '../controllers/locationDetailsController'
import permissionsGuard from '../middleware/permissionsGuard'

export default function locationDetailsRouter(services: Services): Router {
  const router = Router()
  const get = getRequest(router)
  const basePath = '/prisoner/:prisonerNumber([a-zA-Z][0-9]{4}[a-zA-Z]{2})'

  const prisonerLocationDetailsController = new LocationDetailsController(
    services.prisonerLocationDetailsPageService,
    services.auditService,
  )

  get(
    `${basePath}/location-details`,
    auditPageAccessAttempt({ services, page: Page.PrisonerCellHistory }),
    getPrisonerData(services, { minimal: true }),
    permissionsGuard(services.permissionsService.getLocationPermissions),
    async (req, res, next) => {
      const prisonerData = req.middleware?.prisonerData
      return prisonerLocationDetailsController.displayLocationDetails(req, res, prisonerData)
    },
  )

  return router
}
