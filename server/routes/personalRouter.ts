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
  heightFieldData,
  shoeSizeFieldData,
  weightFieldData,
} from '../controllers/personal/fieldData'
import validationMiddleware, { Validator } from '../middleware/validationMiddleware'
import { heightImperialValidator, heightMetricValidator } from '../validators/personal/heightValidator'
import { weightImperialValidator, weightMetricValidator } from '../validators/personal/weightValidator'
import { shoeSizeValidator } from '../validators/personal/shoeSizeValidator'
import distinguishingMarksRouter from './distinguishingMarksRouter'

export default function personalRouter(services: Services): Router {
  const router = Router()
  const basePath = '/prisoner/:prisonerNumber([a-zA-Z][0-9]{4}[a-zA-Z]{2})/personal'
  const get = getRequest(router)
  const post = postRequest(router)

  const personalController = new PersonalController(
    services.personalPageService,
    services.prisonPersonService,
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

  // Temporary edit check for now
  const editRouteChecks = () => (req: Request, res: Response, next: NextFunction) => {
    const { userRoles, activeCaseLoadId } = res.locals.user as PrisonUser
    if (userHasRoles(['DPS_APPLICATION_DEVELOPER'], userRoles) && enablePrisonPerson(activeCaseLoadId)) {
      return next()
    }
    return next(new NotFoundError('User cannot access edit routes', HmppsStatusCode.NOT_FOUND))
  }

  // Distinguishing marks
  router.use(
    `${basePath}/:markType(tattoo|scar|mark)`,
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getOverviewPermissions),
    editRouteChecks(),
    distinguishingMarksRouter(services),
  )

  // Edit routes
  const editRoute = ({
    path,
    edit,
    submit,
  }: {
    path: string
    edit: {
      method: RequestHandler
      audit: Page
    }
    submit: {
      method: RequestHandler
      audit: Page
      validation?: {
        validators: Validator[]
        redirectBackOnError?: boolean
      }
    }
  }) => {
    const routePath = `${basePath}/${path}`

    get(
      routePath,
      auditPageAccessAttempt({ services, page: edit.audit }),
      getPrisonerData(services),
      permissionsGuard(services.permissionsService.getOverviewPermissions),
      editRouteChecks(),
      edit.method,
    )

    if (submit.validation) {
      post(
        routePath,
        auditPageAccessAttempt({ services, page: submit.audit }),
        getPrisonerData(services),
        permissionsGuard(services.permissionsService.getOverviewPermissions),
        editRouteChecks(),
        validationMiddleware(submit.validation.validators, {
          redirectBackOnError: submit.validation.redirectBackOnError || false,
          redirectTo: `personal/${path}`,
        }),
        submit.method,
      )
    } else {
      post(
        routePath,
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
    path: `edit/height`,
    edit: {
      method: personalController.height().metric.edit,
      audit: Page.EditHeight,
    },
    submit: {
      method: personalController.height().metric.submit,
      audit: Page.PostEditHeight,
      validation: {
        validators: [heightMetricValidator],
        redirectBackOnError: true,
      },
    },
  })

  editRoute({
    path: 'edit/height/imperial',
    edit: {
      audit: Page.EditHeight,
      method: personalController.height().imperial.edit,
    },
    submit: {
      audit: Page.PostEditHeight,
      method: personalController.height().imperial.submit,
      validation: {
        validators: [heightImperialValidator],
        redirectBackOnError: true,
      },
    },
  })

  // Weight
  editRoute({
    path: 'edit/weight',
    edit: {
      audit: Page.EditWeight,
      method: personalController.weight().metric.edit,
    },
    submit: {
      audit: Page.PostEditWeight,
      method: personalController.weight().metric.submit,
      validation: {
        validators: [weightMetricValidator],
        redirectBackOnError: true,
      },
    },
  })

  editRoute({
    path: 'edit/weight/imperial',
    edit: {
      audit: Page.EditWeight,
      method: personalController.weight().imperial.edit,
    },
    submit: {
      audit: Page.PostEditWeight,
      method: personalController.weight().imperial.submit,
      validation: {
        validators: [weightImperialValidator],
        redirectBackOnError: true,
      },
    },
  })

  editRoute({
    path: 'edit/shoe-size',
    edit: {
      audit: Page.EditShoeSize,
      method: personalController.physicalAttributesTextInput(shoeSizeFieldData).edit,
    },
    submit: {
      audit: Page.PostEditShoeSize,
      method: personalController.physicalAttributesTextInput(shoeSizeFieldData).submit,
      validation: {
        validators: [shoeSizeValidator],
        redirectBackOnError: true,
      },
    },
  })

  // Hair type or colour
  editRoute({
    path: 'edit/hair',
    edit: {
      audit: Page.EditHairTypeOrColour,
      method: personalController.physicalCharacteristicRadioField(hairFieldData).edit,
    },
    submit: {
      audit: Page.PostEditHairTypeOrColour,
      method: personalController.physicalCharacteristicRadioField(hairFieldData).submit,
    },
  })

  // Facial hair
  editRoute({
    path: 'edit/facial-hair',
    edit: {
      audit: Page.EditFacialHair,
      method: personalController.physicalCharacteristicRadioField(facialHairFieldData).edit,
    },
    submit: {
      audit: Page.PostEditFacialHair,
      method: personalController.physicalCharacteristicRadioField(facialHairFieldData).submit,
    },
  })

  // Face shape
  editRoute({
    path: 'edit/face-shape',
    edit: {
      audit: Page.EditFaceShape,
      method: personalController.physicalCharacteristicRadioField(faceShapeFieldData).edit,
    },
    submit: {
      audit: Page.PostEditFaceShape,
      method: personalController.physicalCharacteristicRadioField(faceShapeFieldData).submit,
    },
  })

  // Build
  editRoute({
    path: 'edit/build',
    edit: {
      audit: Page.EditBuild,
      method: personalController.physicalCharacteristicRadioField(buildFieldData).edit,
    },
    submit: {
      audit: Page.PostEditBuild,
      method: personalController.physicalCharacteristicRadioField(buildFieldData).submit,
    },
  })

  // Smoker/Vaper
  editRoute({
    path: 'edit/smoker-or-vaper',
    edit: {
      audit: Page.EditSmokerOrVaper,
      method: personalController.smokerOrVaper().edit,
    },
    submit: {
      audit: Page.PostEditSmokerOrVaper,
      method: personalController.smokerOrVaper().submit,
    },
  })

  // Eye colour
  editRoute({
    path: 'edit/eye-colour',
    edit: {
      audit: Page.EditEyeColour,
      method: personalController.eyeColour().edit,
    },
    submit: {
      audit: Page.PostEditEyeColour,
      method: personalController.eyeColour().submit,
    },
  })

  editRoute({
    path: 'edit/eye-colour-individual',
    edit: {
      audit: Page.EditEyeColour,
      method: personalController.eyeColourIndividual().edit,
    },
    submit: {
      audit: Page.PostEditEyeColour,
      method: personalController.eyeColourIndividual().submit,
    },
  })

  get(
    `${basePath}/history/height`,
    auditPageAccessAttempt({ services, page: Page.HeightHistory }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getOverviewPermissions),
    personalController.history(heightFieldData),
  )

  get(
    `${basePath}/history/weight`,
    auditPageAccessAttempt({ services, page: Page.WeightHistory }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getOverviewPermissions),
    personalController.history(weightFieldData),
  )

  editRoute({
    path: 'edit/medical-diet',
    edit: {
      audit: Page.EditMedicalDiet,
      method: personalController.medicalDiet().edit,
    },
    submit: {
      audit: Page.PostEditMedicalDiet,
      method: personalController.medicalDiet().submit,
    },
  })

  editRoute({
    path: 'edit/food-allergies',
    edit: {
      audit: Page.EditFoodAllergies,
      method: personalController.foodAllergies().edit,
    },
    submit: {
      audit: Page.PostEditFoodAllergies,
      method: personalController.foodAllergies().submit,
    },
  })

  editRoute({
    path: 'edit/city-or-town-of-birth',
    edit: {
      audit: Page.EditCityOrTownOfBirth,
      method: personalController.cityOrTownOfBirthTextInput().edit,
    },
    submit: {
      audit: Page.PostEditCityOrTownOfBirth,
      method: personalController.cityOrTownOfBirthTextInput().submit,
    },
  })

  editRoute({
    path: 'edit/country-of-birth',
    edit: {
      audit: Page.EditCountryOfBirth,
      method: personalController.countryOfBirth().edit,
    },
    submit: {
      audit: Page.PostEditCountryOfBirth,
      method: personalController.countryOfBirth().submit,
    },
  })

  editRoute({
    path: 'edit/nationality',
    edit: {
      audit: Page.EditNationality,
      method: personalController.nationality().edit,
    },
    submit: {
      audit: Page.PostEditNationality,
      method: personalController.nationality().submit,
    },
  })

  return router
}
