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
import photographRouter from './photographRouter'
import config from '../config'

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
    edit,
    submit,
  }: {
    url: string
    edit: {
      method: RequestHandler
      audit: Page
    }
    submit: {
      method: RequestHandler
      audit: Page
    }
  }) => {
    get(
      url,
      auditPageAccessAttempt({ services, page: edit.audit }),
      getPrisonerData(services),
      permissionsGuard(services.permissionsService.getOverviewPermissions),
      editRouteChecks(),
      edit.method,
    )

    post(
      url,
      auditPageAccessAttempt({ services, page: submit.audit }),
      getPrisonerData(services),
      permissionsGuard(services.permissionsService.getOverviewPermissions),
      editRouteChecks(),
      submit.method,
    )
  }

  editRoute({
    url: `${basePath}/edit/height`,
    edit: {
      method: personalController.height().metric.edit,
      // TODO Fix
      audit: Page.Offences,
    },
    submit: {
      method: personalController.height().metric.submit,
      // TODO Fix
      audit: Page.Offences,
    },
  })

  editRoute({
    url: `${basePath}/edit/height/imperial`,
    // TODO Fix
    edit: {
      audit: Page.Offences,
      method: personalController.height().imperial.edit,
    },
    submit: {
      audit: Page.Offences,
      method: personalController.height().imperial.submit,
    },
  })

  editRoute({
    url: `${basePath}/edit/weight`,
    edit: {
      audit: Page.Offences,
      method: personalController.weight().metric.edit,
    },
    submit: {
      audit: Page.Offences,
      method: personalController.weight().metric.submit,
    },
  })

  editRoute({
    url: `${basePath}/edit/weight/imperial`,
    edit: {
      audit: Page.Offences,
      method: personalController.weight().imperial.edit,
    },
    submit: {
      audit: Page.Offences,
      method: personalController.weight().imperial.submit,
    },
  })

  // Hair type or colour
  editRoute({
    url: `${basePath}/edit/hair`,
    edit: {
      audit: Page.EditHairTypeOrColour,
      method: personalController.radios(hairFieldData).edit,
    },
    submit: {
      audit: Page.PostEditHairTypeOrColour,
      method: personalController.radios(hairFieldData).submit,
    },
  })

  // Facial hair
  editRoute({
    url: `${basePath}/edit/facial-hair`,
    edit: {
      audit: Page.EditFacialHair,
      method: personalController.radios(facialHairFieldData).edit,
    },
    submit: {
      audit: Page.PostEditFacialHair,
      method: personalController.radios(facialHairFieldData).submit,
    },
  })

  // Face shape
  editRoute({
    url: `${basePath}/edit/face-shape`,
    edit: {
      audit: Page.EditFaceShape,
      method: personalController.radios(faceShapeFieldData).edit,
    },
    submit: {
      audit: Page.PostEditFaceShape,
      method: personalController.radios(faceShapeFieldData).submit,
    },
  })

  // Build
  editRoute({
    url: `${basePath}/edit/build`,
    edit: {
      audit: Page.EditBuild,
      method: personalController.radios(buildFieldData).edit,
    },
    submit: {
      audit: Page.PostEditBuild,
      method: personalController.radios(buildFieldData).submit,
    },
  })

  if (config.featureToggles.usePhotoRoutes) {
    router.use(`${basePath}/edit/photo`, photographRouter(services))
  }

  return router
}
