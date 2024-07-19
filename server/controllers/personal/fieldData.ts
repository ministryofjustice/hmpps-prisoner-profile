import { Page } from '../../services/auditService'

export interface FieldData {
  pageTitle: string
  fieldName: string
  code?: string
  hintText?: string
  url: string
  auditPage: Page
}

export const hairFieldData: FieldData = {
  pageTitle: 'Hair type or colour',
  fieldName: 'hair',
  code: 'hair',
  hintText: 'Select the most prominent hair type or colour',
  url: 'hair',
  auditPage: Page.EditHairTypeOrColour,
}

export const facialHairFieldData: FieldData = {
  pageTitle: 'Facial hair',
  fieldName: 'facial hair',
  code: 'facialHair',
  hintText: 'Select the most prominent type of facial hair',
  url: 'facial-hair',
  auditPage: Page.EditFacialHair,
}

export const faceShapeFieldData: FieldData = {
  pageTitle: 'Face shape',
  fieldName: 'face shape',
  code: 'face',
  url: 'face-shape',
  auditPage: Page.EditFaceShape,
}

export const buildFieldData: FieldData = {
  pageTitle: 'Build',
  fieldName: 'build',
  code: 'build',
  url: 'build',
  auditPage: Page.EditBuild,
}
