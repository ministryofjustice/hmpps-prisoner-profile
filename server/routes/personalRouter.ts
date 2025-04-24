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
import { dietAndAllergyEnabled, editProfileEnabled } from '../utils/featureToggles'
import { PrisonUser } from '../interfaces/HmppsUser'
import PersonalController from '../controllers/personal/personalController'
import {
  buildFieldData,
  faceShapeFieldData,
  facialHairFieldData,
  hairFieldData,
  shoeSizeFieldData,
} from '../controllers/personal/fieldData'
import validationMiddleware, { Validator } from '../middleware/validationMiddleware'
import { heightImperialValidator, heightMetricValidator } from '../validators/personal/heightValidator'
import { weightImperialValidator, weightMetricValidator } from '../validators/personal/weightValidator'
import { religionValidator } from '../validators/personal/religionValidator'
import { shoeSizeValidator } from '../validators/personal/shoeSizeValidator'
import distinguishingMarksRouter from './distinguishingMarksRouter'
import { dietAndFoodAllergiesValidator } from '../validators/personal/dietAndFoodAllergiesValidator'
import militaryRecordsRouter from './militaryRecordsRouter'
import { Role } from '../data/enums/role'
import { nationalityValidator } from '../validators/personal/nationalityValidator'
import aliasRouter from './aliasRouter'
import languagesRouter from './languagesRouter'
import nextOfKinRouter from './nextOfKinRouter'
import { numberOfChildrenValidator } from '../validators/personal/numberOfChildrenValidator'

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

  const dietAndAllergiesEditCheck = () => (req: Request, res: Response, next: NextFunction) => {
    const { userRoles, activeCaseLoadId } = res.locals.user as PrisonUser
    if (dietAndAllergyEnabled(activeCaseLoadId) && userHasRoles([Role.DietAndAllergiesEdit], userRoles)) {
      return next()
    }
    return next(new NotFoundError('User cannot access diet and food allergies edit route', HmppsStatusCode.NOT_FOUND))
  }

  // Temporary edit check for now
  const editProfileChecks = () => (req: Request, res: Response, next: NextFunction) => {
    const { userRoles, activeCaseLoadId } = res.locals.user as PrisonUser
    if (userHasRoles(['DPS_APPLICATION_DEVELOPER'], userRoles) && editProfileEnabled(activeCaseLoadId)) {
      return next()
    }
    return next(new NotFoundError('User cannot access edit routes', HmppsStatusCode.NOT_FOUND))
  }

  // Distinguishing marks
  router.use(
    `${basePath}/:markType(tattoo|scar|mark)`,
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getOverviewPermissions),
    editProfileChecks(),
    distinguishingMarksRouter(services),
  )

  // Military history
  router.use(
    `${basePath}`,
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getOverviewPermissions),
    militaryRecordsRouter(services),
  )

  // Aliases
  router.use(
    `${basePath}`,
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getOverviewPermissions),
    aliasRouter(services, editProfileChecks),
  )

  // Languages
  router.use(
    `${basePath}`,
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getOverviewPermissions),
    languagesRouter(services, editProfileChecks),
  )

  // Next of kin and emergency contacts
  router.use(
    `${basePath}`,
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getOverviewPermissions),
    nextOfKinRouter(services, editProfileChecks),
  )

  // Edit routes
  const editRoute = ({
    path,
    edit,
    submit,
    permissionsCheck = editProfileChecks,
  }: {
    requiredRoles?: string[]
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
    permissionsCheck?: () => RequestHandler
  }) => {
    const routePath = `${basePath}/${path}`

    get(
      routePath,
      auditPageAccessAttempt({ services, page: edit.audit }),
      getPrisonerData(services),
      permissionsGuard(services.permissionsService.getOverviewPermissions),
      permissionsCheck(),
      edit.method,
    )

    if (submit.validation) {
      post(
        routePath,
        auditPageAccessAttempt({ services, page: submit.audit }),
        getPrisonerData(services),
        permissionsGuard(services.permissionsService.getOverviewPermissions),
        permissionsCheck(),
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
        permissionsCheck(),
        submit.method,
      )
    }
  }

  // Height
  editRoute({
    path: `height`,
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
    path: 'height/imperial',
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
    path: 'weight',
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
    path: 'weight/imperial',
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
    path: 'shoe-size',
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
    path: 'hair',
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
    path: 'facial-hair',
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
    path: 'face-shape',
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
    path: 'build',
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
    path: 'smoker-or-vaper',
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
    path: 'eye-colour',
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
    path: 'eye-colour-individual',
    edit: {
      audit: Page.EditEyeColour,
      method: personalController.eyeColourIndividual().edit,
    },
    submit: {
      audit: Page.PostEditEyeColour,
      method: personalController.eyeColourIndividual().submit,
    },
  })

  editRoute({
    path: 'diet-and-food-allergies',
    edit: {
      audit: Page.EditDietAndFoodAllergies,
      method: personalController.dietAndFoodAllergies().edit,
    },
    submit: {
      audit: Page.PostEditDietAndFoodAllergies,
      method: personalController.dietAndFoodAllergies().submit,
      validation: {
        validators: [dietAndFoodAllergiesValidator],
        redirectBackOnError: true,
      },
    },
    permissionsCheck: dietAndAllergiesEditCheck,
  })

  editRoute({
    path: 'city-or-town-of-birth',
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
    path: 'country-of-birth',
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
    path: 'nationality',
    edit: {
      audit: Page.EditNationality,
      method: personalController.nationality().edit,
    },
    submit: {
      audit: Page.PostEditNationality,
      method: personalController.nationality().submit,
      validation: {
        validators: [nationalityValidator],
        redirectBackOnError: true,
      },
    },
  })

  editRoute({
    path: 'religion',
    edit: {
      audit: Page.EditReligion,
      method: personalController.religion().edit,
    },
    submit: {
      audit: Page.PostEditReligion,
      method: personalController.religion().submit,
      validation: {
        validators: [religionValidator],
        redirectBackOnError: true,
      },
    },
  })

  editRoute({
    path: 'sexual-orientation',
    edit: {
      audit: Page.EditSexualOrientation,
      method: personalController.sexualOrientation().edit,
    },
    submit: {
      audit: Page.PostEditSexualOrientation,
      method: personalController.sexualOrientation().submit,
    },
  })

  editRoute({
    path: 'children',
    edit: {
      audit: Page.EditNumberOfChildren,
      method: personalController.numberOfChildren().edit,
    },
    submit: {
      audit: Page.PostEditNumberOfChildren,
      method: personalController.numberOfChildren().submit,
      validation: {
        validators: [numberOfChildrenValidator],
        redirectBackOnError: true,
      },
    },
  })

  editRoute({
    path: 'marital-status',
    edit: {
      audit: Page.EditDomesticStatus,
      method: personalController.domesticStatus().edit,
    },
    submit: {
      audit: Page.PostEditDomesticStatus,
      method: personalController.domesticStatus().submit,
    },
  })

  return router
}
