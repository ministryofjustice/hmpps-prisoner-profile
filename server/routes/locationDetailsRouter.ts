import { Router } from 'express'
import {
  PrisonerBaseLocationPermission,
  prisonerPermissionsGuard,
} from '@ministryofjustice/hmpps-prison-permissions-lib'
import { Services } from '../services'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { Page } from '../services/auditService'
import LocationDetailsController from '../controllers/locationDetailsController'

export default function locationDetailsRouter(services: Services): Router {
  const router = Router()
  const basePath = '/prisoner/:prisonerNumber'
  const { prisonPermissionsService } = services

  const prisonerLocationDetailsController = new LocationDetailsController(
    services.locationDetailsService,
    services.auditService,
  )

  router.get(
    `${basePath}/location-details`,
    auditPageAccessAttempt({ services, page: Page.PrisonerCellHistory }),
    getPrisonerData(services, { minimal: true }),
    prisonerPermissionsGuard(prisonPermissionsService, {
      requestDependentOn: [
        PrisonerBaseLocationPermission.read_location_details,
        PrisonerBaseLocationPermission.read_location_history,
      ],
    }),
    async (req, res) => {
      const prisonerData = req.middleware?.prisonerData
      return prisonerLocationDetailsController.displayLocationDetails(req, res, prisonerData)
    },
  )

  return router
}
