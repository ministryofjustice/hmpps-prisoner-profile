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
import validationMiddleware, { Validator } from '../middleware/validationMiddleware'
import { heightImperialValidator, heightMetricValidator } from '../validators/personal/heightValidator'
import { weightImperialValidator, weightMetricValidator } from '../validators/personal/weightValidator'

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
      validation?: {
        validators: Validator[]
        onError?: (req: Request, res: Response) => void
      }
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

    if (submit.validation) {
      post(
        url,
        auditPageAccessAttempt({ services, page: submit.audit }),
        getPrisonerData(services),
        permissionsGuard(services.permissionsService.getOverviewPermissions),
        editRouteChecks(),
        validationMiddleware(submit.validation.validators, submit.validation.onError),
        submit.method,
      )
    } else {
      post(
        url,
        auditPageAccessAttempt({ services, page: submit.audit }),
        getPrisonerData(services),
        permissionsGuard(services.permissionsService.getOverviewPermissions),
        editRouteChecks(),
        submit.method,
      )
    }
  }

  // Height
  editRoute({
    url: `${basePath}/edit/height`,
    edit: {
      method: personalController.height().metric.edit,
      audit: Page.EditHeight,
    },
    submit: {
      method: personalController.height().metric.submit,
      audit: Page.PostEditHeight,
      validation: {
        validators: [heightMetricValidator],
        onError: (req, res) => {
          const { editField } = req.body
          req.flash('fieldValue', editField)
          return res.redirect(`/prisoner/${req.params.prisonerNumber}/personal/edit/height`)
        },
      },
    },
  })

  editRoute({
    url: `${basePath}/edit/height/imperial`,
    edit: {
      audit: Page.EditHeight,
      method: personalController.height().imperial.edit,
    },
    submit: {
      audit: Page.PostEditHeight,
      method: personalController.height().imperial.submit,
      validation: {
        validators: [heightImperialValidator],
        onError: (req, res) => {
          const { feet, inches } = req.body
          req.flash('feetValue', feet)
          req.flash('inchesValue', inches)
          return res.redirect(`/prisoner/${req.params.prisonerNumber}/personal/edit/height/imperial`)
        },
      },
    },
  })

  // Weight
  editRoute({
    url: `${basePath}/edit/weight`,
    edit: {
      audit: Page.EditWeight,
      method: personalController.weight().metric.edit,
    },
    submit: {
      audit: Page.PostEditWeight,
      method: personalController.weight().metric.submit,
      validation: {
        validators: [weightMetricValidator],
        onError: (req, res) => {
          const { kilograms } = req.body
          req.flash('kilogramsValue', kilograms)
          return res.redirect(`/prisoner/${req.params.prisonerNumber}/personal/edit/weight`)
        },
      },
    },
  })

  editRoute({
    url: `${basePath}/edit/weight/imperial`,
    edit: {
      audit: Page.EditWeight,
      method: personalController.weight().imperial.edit,
    },
    submit: {
      audit: Page.PostEditWeight,
      method: personalController.weight().imperial.submit,
      validation: {
        validators: [weightImperialValidator],
        onError: (req, res) => {
          const { stone, pounds } = req.body
          req.flash('stoneValue', stone)
          req.flash('poundsValue', pounds)
          return res.redirect(`/prisoner/${req.params.prisonerNumber}/personal/edit/weight/imperial`)
        },
      },
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

  return router
}
