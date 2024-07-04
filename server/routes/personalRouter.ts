import { NextFunction, Request, RequestHandler, Response, Router } from 'express'
import { getRequest, postRequest } from './routerUtils'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { Page } from '../services/auditService'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import { Services } from '../services'
import permissionsGuard from '../middleware/permissionsGuard'
import { userHasRoles } from '../utils/utils'
import NotFoundError from '../utils/notFoundError'
import { HmppsStatusCode } from '../data/enums/hmppsStatusCode'
import { enablePrisonPerson } from '../utils/featureToggles'
import { PrisonUser } from '../interfaces/HmppsUser'
import PersonalController from '../controllers/personal/personalController'
import {
  buildFieldData,
  faceShapeFieldData,
  facialHairFieldData,
  hairFieldData,
} from '../controllers/personal/fieldData'

export default function personalRouter(services: Services): Router {
  const router = Router()
  const basePath = '/prisoner/:prisonerNumber([a-zA-Z][0-9]{4}[a-zA-Z]{2})/personal'
  const get = getRequest(router)
  const post = postRequest(router)

  const personalController = new PersonalController(
    services.personalPageService,
    services.careNeedsService,
    services.auditService,
  )

  get(
    basePath,
    auditPageAccessAttempt({ services, page: Page.Personal }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getOverviewPermissions),
    personalController.displayPersonalPage(),
  )

  // Edit routes
  // Temporary edit check for now
  const editRouteChecks = () => (req: Request, res: Response, next: NextFunction) => {
    const { userRoles, activeCaseLoadId } = res.locals.user as PrisonUser
    if (userHasRoles(['DPS_APPLICATION_DEVELOPER'], userRoles) && enablePrisonPerson(activeCaseLoadId)) {
      return next()
    }
    return next(new NotFoundError('User cannot access edit routes', HmppsStatusCode.NOT_FOUND))
  }

  const editRoute = ({
    url,
    getMethod,
    submitMethod,
  }: {
    url: string
    getMethod: RequestHandler
    submitMethod: RequestHandler
  }) => {
    get(
      url,
      getPrisonerData(services),
      permissionsGuard(services.permissionsService.getOverviewPermissions),
      editRouteChecks(),
      getMethod,
    )

    post(
      url,
      getPrisonerData(services),
      permissionsGuard(services.permissionsService.getOverviewPermissions),
      editRouteChecks(),
      submitMethod,
    )
  }

  editRoute({
    url: `${basePath}/edit/height`,
    getMethod: personalController.height().metric.edit,
    submitMethod: personalController.height().metric.submit,
  })

  editRoute({
    url: `${basePath}/edit/height/imperial`,
    getMethod: personalController.height().imperial.edit,
    submitMethod: personalController.height().imperial.submit,
  })

  editRoute({
    url: `${basePath}/edit/weight`,
    getMethod: personalController.weight().metric.edit,
    submitMethod: personalController.weight().metric.submit,
  })

  editRoute({
    url: `${basePath}/edit/weight/imperial`,
    getMethod: personalController.weight().imperial.edit,
    submitMethod: personalController.weight().imperial.submit,
  })

  // Hair type or colour
  get(
    `${basePath}/edit/hair`,
    // TODO: Add role check here
    auditPageAccessAttempt({ services, page: Page.EditHairTypeOrColour }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getOverviewPermissions),
    editRouteChecks(),
    personalController.radios(hairFieldData).edit,
  )

  post(
    `${basePath}/edit/hair`,
    // TODO: Add role check here
    auditPageAccessAttempt({ services, page: Page.PostEditHairTypeOrColour }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getOverviewPermissions),
    editRouteChecks(),
    personalController.radios(hairFieldData).submit,
  )

  // Facial hair
  get(
    `${basePath}/edit/facial-hair`,
    // TODO: Add role check here
    auditPageAccessAttempt({ services, page: Page.EditFacialHair }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getOverviewPermissions),
    editRouteChecks(),
    personalController.radios(facialHairFieldData).edit,
  )

  post(
    `${basePath}/edit/facial-hair`,
    // TODO: Add role check here
    auditPageAccessAttempt({ services, page: Page.PostEditFacialHair }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getOverviewPermissions),
    editRouteChecks(),
    personalController.radios(facialHairFieldData).submit,
  )

  // Face shape
  get(
    `${basePath}/edit/face-shape`,
    // TODO: Add role check here
    auditPageAccessAttempt({ services, page: Page.EditFaceShape }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getOverviewPermissions),
    editRouteChecks(),
    personalController.radios(faceShapeFieldData).edit,
  )

  post(
    `${basePath}/edit/face-shape`,
    // TODO: Add role check here
    auditPageAccessAttempt({ services, page: Page.PostEditFaceShape }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getOverviewPermissions),
    editRouteChecks(),
    personalController.radios(faceShapeFieldData).submit,
  )

  // Build
  get(
    `${basePath}/edit/build`,
    // TODO: Add role check here
    auditPageAccessAttempt({ services, page: Page.EditBuild }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getOverviewPermissions),
    editRouteChecks(),
    personalController.radios(buildFieldData).edit,
  )

  post(
    `${basePath}/edit/build`,
    // TODO: Add role check here
    auditPageAccessAttempt({ services, page: Page.PostEditBuild }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getOverviewPermissions),
    editRouteChecks(),
    personalController.radios(buildFieldData).submit,
  )

  return router
}
