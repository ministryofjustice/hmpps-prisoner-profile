import {
  PrisonPersonCharacteristicCode,
  PrisonPersonPhysicalAttributes,
} from '../../data/interfaces/prisonPersonApi/prisonPersonApiClient'
import { Page } from '../../services/auditService'

export interface FieldData {
  pageTitle: string
  auditPage: Page
  url: string
}

export interface TextFieldData extends FieldData {
  fieldName: keyof PrisonPersonPhysicalAttributes
  hintText?: string
  inputClasses?: string
}
export interface RadioFieldData extends FieldData {
  fieldName: string
  code?: PrisonPersonCharacteristicCode
  hintText?: string
}

export const shoeSizeFieldData: TextFieldData = {
  pageTitle: 'Shoe size',
  fieldName: 'shoeSize',
  hintText: 'Enter a UK shoe size, for example 7.5 or 11.',
  auditPage: Page.EditShoeSize,
  url: 'shoe-size',
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
