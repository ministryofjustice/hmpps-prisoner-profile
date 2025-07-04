import { RequestHandler, Router } from 'express'
import {
  CorePersonRecordPermission,
  PersonalRelationshipsPermission,
  PersonCommunicationNeedsPermission,
  PersonHealthAndMedicationPermission,
  PersonProtectedCharacteristicsPermission,
  PrisonerBasePermission,
  PrisonerPermission,
  prisonerPermissionsGuard,
} from '@ministryofjustice/hmpps-prison-permissions-lib'
import { getRequest, postRequest } from './routerUtils'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { Page } from '../services/auditService'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import { Services } from '../services'
import { dietAndAllergyEnabled, editProfileEnabled, militaryHistoryEnabled } from '../utils/featureToggles'
import PersonalController from '../controllers/personal/personalController'
import {
  buildFieldData,
  faceShapeFieldData,
  facialHairFieldData,
  hairFieldData,
  shoeSizeFieldData,
} from '../controllers/personal/fieldData'
import validationMiddleware, {
  RedirectWithParams,
  ValidationMiddlewareOptions,
  Validator,
} from '../middleware/validationMiddleware'
import { heightImperialValidator, heightMetricValidator } from '../validators/personal/heightValidator'
import { weightImperialValidator, weightMetricValidator } from '../validators/personal/weightValidator'
import { religionValidator } from '../validators/personal/religionValidator'
import { shoeSizeValidator } from '../validators/personal/shoeSizeValidator'
import distinguishingMarksRouter from './distinguishingMarksRouter'
import { dietAndFoodAllergiesValidator } from '../validators/personal/dietAndFoodAllergiesValidator'
import militaryRecordsRouter from './militaryRecordsRouter'
import { nationalityValidator } from '../validators/personal/nationalityValidator'
import aliasRouter from './aliasRouter'
import languagesRouter from './languagesRouter'
import nextOfKinRouter from './nextOfKinRouter'
import { numberOfChildrenValidator } from '../validators/personal/numberOfChildrenValidator'
import addressEditRouter from './addressEditRouter'
import { emailValidator } from '../validators/personal/emailValidator'
import identityNumbersRouter from './identityNumbersRouter'
import { phoneNumberValidator } from '../validators/personal/phoneNumberValidator'
import { populateEditPageData } from '../middleware/populateEditPageData'
import { featureFlagGuard, FeatureFlagMethod } from '../middleware/featureFlagGuard'

export default function personalRouter(services: Services): Router {
  const router = Router()
  const basePath = '/prisoner/:prisonerNumber([a-zA-Z][0-9]{4}[a-zA-Z]{2})/personal'
  const get = getRequest(router)
  const post = postRequest(router)
  const { prisonPermissionsService } = services

  const personalController = new PersonalController(
    services.personalPageService,
    services.careNeedsService,
    services.auditService,
  )

  get(
    basePath,
    auditPageAccessAttempt({ services, page: Page.Personal }),
    getPrisonerData(services),
    prisonerPermissionsGuard(prisonPermissionsService, { requestDependentOn: [PrisonerBasePermission.read] }),
    personalController.displayPersonalPage(),
  )

  // Distinguishing marks
  router.use(
    `${basePath}/:markType(tattoo|scar|mark)`,
    getPrisonerData(services),
    featureFlagGuard('Profile Edit', editProfileEnabled),
    prisonerPermissionsGuard(prisonPermissionsService, {
      requestDependentOn: [CorePersonRecordPermission.edit_distinguishing_marks],
    }),
    populateEditPageData(),
    distinguishingMarksRouter(services),
  )

  // Military history
  router.use(
    `${basePath}`,
    getPrisonerData(services),
    featureFlagGuard('Military History', militaryHistoryEnabled),
    prisonerPermissionsGuard(prisonPermissionsService, {
      requestDependentOn: [CorePersonRecordPermission.edit_military_history],
    }),
    populateEditPageData(),
    militaryRecordsRouter(services),
  )

  // Addresses
  router.use(
    `${basePath}`,
    getPrisonerData(services),
    featureFlagGuard('Profile Edit', editProfileEnabled),
    prisonerPermissionsGuard(prisonPermissionsService, {
      requestDependentOn: [CorePersonRecordPermission.edit_address],
    }),
    populateEditPageData(),
    addressEditRouter(services),
  )

  // Aliases
  router.use(
    `${basePath}`,
    getPrisonerData(services),
    featureFlagGuard('Profile Edit', editProfileEnabled),
    prisonerPermissionsGuard(prisonPermissionsService, {
      requestDependentOn: [CorePersonRecordPermission.edit_name_and_aliases],
    }),
    populateEditPageData(),
    aliasRouter(services),
  )

  // Languages
  router.use(
    `${basePath}`,
    getPrisonerData(services),
    featureFlagGuard('Profile Edit', editProfileEnabled),
    prisonerPermissionsGuard(prisonPermissionsService, {
      requestDependentOn: [PersonCommunicationNeedsPermission.edit_language],
    }),
    populateEditPageData(),
    languagesRouter(services),
  )

  // Next of kin and emergency contacts
  router.use(
    `${basePath}`,
    getPrisonerData(services),
    featureFlagGuard('Profile Edit', editProfileEnabled),
    prisonerPermissionsGuard(prisonPermissionsService, {
      requestDependentOn: [PersonalRelationshipsPermission.edit_emergency_contacts],
    }),
    populateEditPageData(),
    nextOfKinRouter(services),
  )

  // Identity numbers
  router.use(
    `${basePath}`,
    getPrisonerData(services),
    featureFlagGuard('Profile Edit', editProfileEnabled),
    prisonerPermissionsGuard(prisonPermissionsService, {
      requestDependentOn: [CorePersonRecordPermission.edit_identifiers],
    }),
    populateEditPageData(),
    identityNumbersRouter(services),
  )

  // Edit routes
  const editRoute = ({
    path,
    edit,
    submit,
    requiredPermission,
    featureFlag = { featureName: 'Profile Edit', method: editProfileEnabled },
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
        redirectTo?: RedirectWithParams
      }
    }
    requiredPermission: PrisonerPermission
    featureFlag?: { featureName: string; method: FeatureFlagMethod }
  }) => {
    const routePath = `${basePath}/${path}`

    get(
      routePath,
      auditPageAccessAttempt({ services, page: edit.audit }),
      getPrisonerData(services),
      featureFlagGuard(featureFlag.featureName, featureFlag.method),
      prisonerPermissionsGuard(prisonPermissionsService, { requestDependentOn: [requiredPermission] }),
      populateEditPageData(),
      edit.method,
    )

    if (submit.validation) {
      const validationOptions: ValidationMiddlewareOptions = {
        redirectBackOnError: submit.validation.redirectBackOnError || false,
      }
      if (submit.validation.redirectTo) {
        validationOptions.redirectWithParams = submit.validation.redirectTo
      } else {
        validationOptions.redirectTo = `personal/${path}`
      }

      post(
        routePath,
        auditPageAccessAttempt({ services, page: submit.audit }),
        getPrisonerData(services),
        featureFlagGuard(featureFlag.featureName, featureFlag.method),
        prisonerPermissionsGuard(prisonPermissionsService, { requestDependentOn: [requiredPermission] }),
        validationMiddleware(submit.validation.validators, validationOptions),
        submit.method,
      )
    } else {
      post(
        routePath,
        auditPageAccessAttempt({ services, page: submit.audit }),
        getPrisonerData(services),
        featureFlagGuard(featureFlag.featureName, featureFlag.method),
        prisonerPermissionsGuard(prisonPermissionsService, { requestDependentOn: [requiredPermission] }),
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
    requiredPermission: CorePersonRecordPermission.edit_physical_characteristics,
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
    requiredPermission: CorePersonRecordPermission.edit_physical_characteristics,
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
    requiredPermission: CorePersonRecordPermission.edit_physical_characteristics,
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
    requiredPermission: CorePersonRecordPermission.edit_physical_characteristics,
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
    requiredPermission: CorePersonRecordPermission.edit_physical_characteristics,
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
    requiredPermission: CorePersonRecordPermission.edit_physical_characteristics,
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
    requiredPermission: CorePersonRecordPermission.edit_physical_characteristics,
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
    requiredPermission: CorePersonRecordPermission.edit_physical_characteristics,
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
    requiredPermission: CorePersonRecordPermission.edit_physical_characteristics,
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
    requiredPermission: CorePersonRecordPermission.edit_physical_characteristics,
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
    requiredPermission: CorePersonRecordPermission.edit_physical_characteristics,
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
    requiredPermission: PersonHealthAndMedicationPermission.edit_smoker,
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
    requiredPermission: PersonHealthAndMedicationPermission.edit_diet,
    featureFlag: { featureName: 'Diet and Allergy', method: dietAndAllergyEnabled },
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
    requiredPermission: CorePersonRecordPermission.edit_place_of_birth,
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
    requiredPermission: CorePersonRecordPermission.edit_place_of_birth,
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
    requiredPermission: CorePersonRecordPermission.edit_nationality,
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
    requiredPermission: PersonProtectedCharacteristicsPermission.edit_religion_and_belief,
    featureFlag: { featureName: 'Religion Edit', method: () => true },
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
    requiredPermission: PersonProtectedCharacteristicsPermission.edit_sexual_orientation,
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
    requiredPermission: PersonalRelationshipsPermission.edit_number_of_children,
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
    requiredPermission: PersonalRelationshipsPermission.edit_domestic_status,
  })

  editRoute({
    path: 'add-phone-number',
    edit: {
      audit: Page.AddPhoneNumber,
      method: personalController.globalNumbers().add.edit,
    },
    submit: {
      audit: Page.PostAddPhoneNumber,
      method: personalController.globalNumbers().add.submit,
      validation: {
        validators: [phoneNumberValidator],
        redirectBackOnError: true,
      },
    },
    requiredPermission: CorePersonRecordPermission.edit_phone_numbers,
  })

  editRoute({
    path: 'change-phone-number/:phoneNumberId',
    edit: {
      audit: Page.EditPhoneNumber,
      method: personalController.globalNumbers().edit.edit,
    },
    submit: {
      audit: Page.PostEditPhoneNumber,
      method: personalController.globalNumbers().edit.submit,
      validation: {
        validators: [phoneNumberValidator],
        redirectBackOnError: true,
        redirectTo: ({ phoneNumberId }) => `personal/change-phone-number/${phoneNumberId}`,
      },
    },
    requiredPermission: CorePersonRecordPermission.edit_phone_numbers,
  })

  // Global emails
  editRoute({
    path: 'add-email-address',
    edit: {
      audit: Page.AddEmailAddress,
      method: personalController.globalEmails().add.edit,
    },
    submit: {
      audit: Page.AddEmailAddress,
      method: personalController.globalEmails().add.submit,
      validation: {
        validators: [emailValidator],
        redirectBackOnError: true,
      },
    },
    requiredPermission: CorePersonRecordPermission.edit_email_addresses,
  })

  editRoute({
    path: 'change-email-address/:emailAddressId',
    edit: {
      audit: Page.EditEmailAddress,
      method: personalController.globalEmails().edit.edit,
    },
    submit: {
      audit: Page.PostEditEmailAddress,
      method: personalController.globalEmails().edit.submit,
      validation: {
        validators: [emailValidator],
        redirectBackOnError: true,
        redirectTo: ({ emailAddressId }) => `personal/change-email-address/${emailAddressId}`,
      },
    },
    requiredPermission: CorePersonRecordPermission.edit_email_addresses,
  })

  return router
}
