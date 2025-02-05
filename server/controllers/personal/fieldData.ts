import {
  PrisonPersonCharacteristicCode,
  PrisonPersonPhysicalAttributes,
} from '../../data/interfaces/prisonPersonApi/prisonPersonApiClient'
import { Page, PostAction } from '../../services/auditService'
import { formatHeight, formatWeight } from '../../utils/utils'

export interface FieldData {
  url: string
  fieldName: string
  pageTitle: string
  auditEditPageLoad: Page
  auditEditPostAction: PostAction
  redirectAnchor: string
  hintText?: string
}

export interface TextFieldData extends FieldData {
  inputClasses?: string
  formatter?: (value: number | string) => string
}

export interface PhysicalAttributesTextFieldData extends TextFieldData {
  fieldName: keyof PrisonPersonPhysicalAttributes
}

export interface RadioFieldData extends FieldData {
  code?: PrisonPersonCharacteristicCode
}

export interface CheckboxFieldData extends FieldData {
  options?: {
    showDontKnow?: boolean
    showNo?: boolean
  }
}

export const shoeSizeFieldData: PhysicalAttributesTextFieldData = {
  url: 'shoe-size',
  fieldName: 'shoeSize',
  pageTitle: 'Shoe size',
  auditEditPageLoad: Page.EditShoeSize,
  auditEditPostAction: PostAction.EditShoeSize,
  hintText: 'Enter a UK shoe size, for example 7.5 or 11.',
  redirectAnchor: 'appearance',
  inputClasses: 'govuk-input--width-5',
}

export const hairFieldData: RadioFieldData = {
  url: 'hair',
  fieldName: 'hair',
  pageTitle: 'Hair type or colour',
  auditEditPageLoad: Page.EditHairTypeOrColour,
  auditEditPostAction: PostAction.EditHairTypeOrColour,
  code: PrisonPersonCharacteristicCode.hair,
  hintText: 'Select the most prominent hair type or colour.',
  redirectAnchor: 'appearance',
}

export const facialHairFieldData: RadioFieldData = {
  url: 'facial-hair',
  fieldName: 'facialHair',
  pageTitle: 'Facial hair',
  auditEditPageLoad: Page.EditFacialHair,
  auditEditPostAction: PostAction.EditFacialHair,
  code: PrisonPersonCharacteristicCode.facialHair,
  hintText: 'Select the most prominent type of facial hair.',
  redirectAnchor: 'appearance',
}

export const faceShapeFieldData: RadioFieldData = {
  url: 'face-shape',
  fieldName: 'faceShape',
  pageTitle: 'Face shape',
  auditEditPageLoad: Page.EditFaceShape,
  auditEditPostAction: PostAction.EditFaceShape,
  code: PrisonPersonCharacteristicCode.face,
  redirectAnchor: 'appearance',
}

export const buildFieldData: RadioFieldData = {
  url: 'build',
  fieldName: 'build',
  pageTitle: 'Build',
  auditEditPageLoad: Page.EditBuild,
  auditEditPostAction: PostAction.EditBuild,
  code: PrisonPersonCharacteristicCode.build,
  redirectAnchor: 'appearance',
}

export const eyeColourFieldData: FieldData = {
  url: 'eye-colour',
  fieldName: 'eyeColour',
  pageTitle: 'Eye colour',
  auditEditPageLoad: Page.EditEyeColour,
  auditEditPostAction: PostAction.EditEyeColour,
  redirectAnchor: 'appearance',
}

export const eyeColourIndividualFieldData: FieldData = {
  ...eyeColourFieldData,
  url: 'eye-colour-individual',
  pageTitle: 'Left and right eye colours',
}

export const smokerOrVaperFieldData: RadioFieldData = {
  url: 'smoker-or-vaper',
  fieldName: 'smokerOrVaper',
  pageTitle: 'Smoker or vaper',
  auditEditPageLoad: Page.EditSmokerOrVaper,
  auditEditPostAction: PostAction.EditSmokerOrVaper,
  redirectAnchor: 'personal-details',
}

export const heightFieldData: PhysicalAttributesTextFieldData = {
  url: 'height',
  fieldName: 'height',
  pageTitle: 'Height',
  auditEditPageLoad: Page.EditHeight,
  auditEditPostAction: PostAction.EditHeight,
  redirectAnchor: 'appearance',
  formatter: formatHeight,
}

export const weightFieldData: PhysicalAttributesTextFieldData = {
  url: 'weight',
  fieldName: 'weight',
  pageTitle: 'Weight',
  auditEditPageLoad: Page.EditWeight,
  auditEditPostAction: PostAction.EditWeight,
  redirectAnchor: 'appearance',
  formatter: formatWeight,
}

export const cityOrTownOfBirthFieldData: TextFieldData = {
  url: 'city-or-town-of-birth',
  fieldName: 'cityOrTownOfBirth',
  pageTitle: 'City or town of birth',
  auditEditPageLoad: Page.EditCityOrTownOfBirth,
  auditEditPostAction: PostAction.EditCityOrTownOfBirth,
  redirectAnchor: 'personal-details',
  inputClasses: 'govuk-!-width-one-third',
}

export const countryOfBirthFieldData: RadioFieldData = {
  url: 'country-of-birth',
  fieldName: 'countryOfBirth',
  pageTitle: 'Country of birth',
  auditEditPageLoad: Page.EditCountryOfBirth,
  auditEditPostAction: PostAction.EditCountryOfBirth,
  redirectAnchor: 'personal-details',
}

export const nationalityFieldData: RadioFieldData = {
  pageTitle: 'Nationality',
  fieldName: 'nationality',
  auditEditPageLoad: Page.EditNationality,
  auditEditPostAction: PostAction.EditNationality,
  url: 'nationality',
  redirectAnchor: 'personal-details',
}

export const foodAllergiesFieldData: CheckboxFieldData = {
  url: 'food-allergies',
  fieldName: 'foodAllergies',
  pageTitle: 'Food allergies',
  auditEditPageLoad: Page.EditFoodAllergies,
  auditEditPostAction: PostAction.EditFoodAllergies,
  hintText: 'Select all that apply',
  redirectAnchor: 'personal-details',
}

export const medicalDietFieldData: CheckboxFieldData = {
  url: 'medical-diet',
  fieldName: 'medicalDiet',
  pageTitle: 'Medical diet',
  auditEditPageLoad: Page.EditMedicalDiet,
  auditEditPostAction: PostAction.EditMedicalDiet,
  hintText: 'Select all that apply',
  redirectAnchor: 'personal-details',
}

export const dietAndFoodAllergiesFieldData: FieldData = {
  url: 'diet-and-food-allergies',
  fieldName: 'dietAndFoodAllergies',
  pageTitle: 'Diet and food allergies',
  auditEditPageLoad: Page.EditDietAndFoodAllergies,
  auditEditPostAction: PostAction.EditDietAndFoodAllergies,
  redirectAnchor: 'personal-details',
}

export const religionFieldData: FieldData = {
  url: 'religion',
  fieldName: 'religion',
  pageTitle: 'Religion, faith or belief',
  auditEditPageLoad: Page.EditReligion,
  auditEditPostAction: PostAction.EditReligion,
  redirectAnchor: 'personal-details',
}
