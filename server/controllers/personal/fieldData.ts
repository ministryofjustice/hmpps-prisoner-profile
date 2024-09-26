import {
  PrisonPersonCharacteristicCode,
  PrisonPersonPhysicalAttributes,
} from '../../data/interfaces/prisonPersonApi/prisonPersonApiClient'
import { Page } from '../../services/auditService'
import { formatHeight, formatWeight } from '../../utils/utils'

export interface FieldData {
  fieldName: string
  pageTitle: string
  auditPage: Page
  url: string
  hintText?: string
}

export interface TextFieldData extends FieldData {
  redirectAnchor: string
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
  pageTitle: 'Shoe size',
  fieldName: 'shoeSize',
  hintText: 'Enter a UK shoe size, for example 7.5 or 11.',
  auditPage: Page.EditShoeSize,
  url: 'shoe-size',
  redirectAnchor: 'appearance',
  inputClasses: 'govuk-input--width-5',
}

export const hairFieldData: RadioFieldData = {
  pageTitle: 'Hair type or colour',
  fieldName: 'hair',
  code: PrisonPersonCharacteristicCode.hair,
  hintText: 'Select the most prominent hair type or colour.',
  url: 'hair',
  auditPage: Page.EditHairTypeOrColour,
}

export const facialHairFieldData: RadioFieldData = {
  pageTitle: 'Facial hair',
  fieldName: 'facialHair',
  code: PrisonPersonCharacteristicCode.facialHair,
  hintText: 'Select the most prominent type of facial hair.',
  url: 'facial-hair',
  auditPage: Page.EditFacialHair,
}

export const faceShapeFieldData: RadioFieldData = {
  pageTitle: 'Face shape',
  fieldName: 'faceShape',
  code: PrisonPersonCharacteristicCode.face,
  url: 'face-shape',
  auditPage: Page.EditFaceShape,
}

export const buildFieldData: RadioFieldData = {
  pageTitle: 'Build',
  fieldName: 'build',
  code: PrisonPersonCharacteristicCode.build,
  url: 'build',
  auditPage: Page.EditBuild,
}

export const smokerOrVaperFieldData: RadioFieldData = {
  auditPage: Page.EditSmokerOrVaper,
  fieldName: 'smokerOrVaper',
  pageTitle: 'Smoker or vaper',
  url: 'smoker-or-vaper',
}

export const heightFieldData: PhysicalAttributesTextFieldData = {
  auditPage: Page.HeightHistory,
  fieldName: 'height',
  pageTitle: 'Height',
  url: 'height',
  redirectAnchor: 'appearance',
  formatter: formatHeight,
}

export const weightFieldData: PhysicalAttributesTextFieldData = {
  auditPage: Page.WeightHistory,
  fieldName: 'weight',
  pageTitle: 'Weight',
  url: 'weight',
  redirectAnchor: 'appearance',
  formatter: formatWeight,
}

export const cityOrTownOfBirthFieldData: TextFieldData = {
  pageTitle: 'City or town of birth',
  fieldName: 'cityOrTownOfBirth',
  auditPage: Page.EditCityOrTownOfBirth,
  url: 'city-or-town-of-birth',
  redirectAnchor: 'personal-details',
  inputClasses: 'govuk-!-width-one-third',
}
