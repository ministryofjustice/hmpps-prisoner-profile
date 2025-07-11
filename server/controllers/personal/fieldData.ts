import { Page, PostAction } from '../../services/auditService'
import { formatHeight, formatName, formatWeight } from '../../utils/utils'
import {
  CorePersonPhysicalAttributesRequest,
  CorePersonRecordReferenceDataDomain,
} from '../../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { ReferenceDataOverride } from './referenceDataOverride'
import { NameFormatStyle } from '../../data/enums/nameFormatStyle'

export interface FieldData {
  url: string
  fieldName: string
  pageTitle: string
  formTitle?: string
  auditEditPageLoad: Page
  auditEditPostAction: PostAction
  redirectAnchor: string
  hintText?: string
  successFlashFieldName?: string
}

export interface TextFieldData extends FieldData {
  inputClasses?: string
  submitButtonText?: string
  formTitle?: string
  formatter?: (value: number | string) => string
}

export interface PhysicalAttributesTextFieldData extends TextFieldData {
  fieldName: keyof CorePersonPhysicalAttributesRequest
}

export interface RadioFieldData extends FieldData {
  code?: keyof CorePersonPhysicalAttributesRequest
  domain?: CorePersonRecordReferenceDataDomain
  referenceDataOverrides?: ReferenceDataOverride[]
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
  code: 'hairCode',
  domain: CorePersonRecordReferenceDataDomain.hair,
  hintText: 'Select the most prominent hair type or colour.',
  redirectAnchor: 'appearance',
}

export const facialHairFieldData: RadioFieldData = {
  url: 'facial-hair',
  fieldName: 'facialHair',
  pageTitle: 'Facial hair',
  auditEditPageLoad: Page.EditFacialHair,
  auditEditPostAction: PostAction.EditFacialHair,
  code: 'facialHairCode',
  domain: CorePersonRecordReferenceDataDomain.facialHair,
  hintText: 'Select the most prominent type of facial hair.',
  redirectAnchor: 'appearance',
}

export const faceShapeFieldData: RadioFieldData = {
  url: 'face-shape',
  fieldName: 'faceShape',
  pageTitle: 'Face shape',
  auditEditPageLoad: Page.EditFaceShape,
  auditEditPostAction: PostAction.EditFaceShape,
  code: 'faceCode',
  domain: CorePersonRecordReferenceDataDomain.face,
  redirectAnchor: 'appearance',
}

export const buildFieldData: RadioFieldData = {
  url: 'build',
  fieldName: 'build',
  pageTitle: 'Build',
  auditEditPageLoad: Page.EditBuild,
  auditEditPostAction: PostAction.EditBuild,
  code: 'buildCode',
  domain: CorePersonRecordReferenceDataDomain.build,
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
  successFlashFieldName: 'Smoking and vaping',
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

export const heightImperialFieldData: PhysicalAttributesTextFieldData = {
  ...heightFieldData,
  url: 'height/imperial',
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

export const weightImperialFieldData: PhysicalAttributesTextFieldData = {
  ...weightFieldData,
  url: 'weight/imperial',
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
  url: 'nationality',
  fieldName: 'nationality',
  pageTitle: 'Nationality',
  auditEditPageLoad: Page.EditNationality,
  auditEditPostAction: PostAction.EditNationality,
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

export const religionFieldData: RadioFieldData = {
  url: 'religion',
  fieldName: 'religion',
  pageTitle: 'Religion, faith or belief',
  auditEditPageLoad: Page.EditReligion,
  auditEditPostAction: PostAction.EditReligion,
  redirectAnchor: 'personal-details',
  referenceDataOverrides: [
    {
      id: 'BAHA',
      description: 'Baháʼí',
    },
    {
      id: 'COFE',
      description: 'Christian - Anglican',
      hint: 'Includes Church of England, Church of Ireland, Church in Wales, Church of Norway, Church of Sweden, Episcopalian, and Lutheran',
    },
    {
      id: 'CHRODX',
      hint: 'Includes Bulgarian Orthodox, Eastern Orthodox, Greek Orthodox, Romanian Orthodox, Russian Orthodox, Serbian Orthodox, and Ukrainian Orthodox',
    },
    {
      id: 'CHRST',
      hint: 'Includes Apostolic, Calvinist, Celestial Church of God, Church of Scotland, Congregational, Dutch Reform Church, Evangelical, Gospel, Nonconformist, Pentecostal, Protestant, Salvation Army, United Reformed, and Welsh Independent',
    },
    {
      id: 'CHJCLDS',
      description: 'Church of Jesus Christ of Latter-day Saints',
    },
    {
      id: 'HNDHAR',
      description: 'Hindu or Hare Krishna',
    },
    {
      id: 'PAGDRU',
      description: 'Pagan or Druid',
    },
    {
      id: 'SECULR',
      description: 'Secularist',
    },
    {
      id: 'SHNTAO',
      description: 'Shintoist or Taoist',
    },
    {
      id: 'SUNI',
      hint: 'Most Muslims in the UK are Sunni, they will often describe themselves just as Muslim',
    },
    {
      id: 'OTH',
      description: 'Other religion, faith or belief',
      hint: 'Includes Christadelphian, Unification, Unitarian and all other religions, faiths or beliefs',
    },
    {
      id: 'NIL',
      description: 'No religion, faith or belief',
    },
    {
      id: 'TPRNTS',
      description: 'They prefer not to say',
    },
  ],
}

export const sexualOrientationFieldData: RadioFieldData = {
  url: 'sexual-orientation',
  fieldName: 'sexualOrientation',
  pageTitle: 'Sexual orientation',
  auditEditPageLoad: Page.EditSexualOrientation,
  auditEditPostAction: PostAction.EditSexualOrientation,
  redirectAnchor: 'personal-details',
}

export const numberOfChildrenFieldData: RadioFieldData = {
  url: 'children',
  fieldName: 'numberOfChildren',
  pageTitle: 'Children',
  auditEditPageLoad: Page.EditNumberOfChildren,
  auditEditPostAction: PostAction.EditNumberOfChildren,
  redirectAnchor: 'personal-details',
  successFlashFieldName: 'Number of children',
}

export const domesticStatusFieldData: RadioFieldData = {
  url: 'marital-status',
  fieldName: 'domesticStatus',
  pageTitle: 'Marital or civil partnership status',
  auditEditPageLoad: Page.EditDomesticStatus,
  auditEditPostAction: PostAction.EditDomesticStatus,
  redirectAnchor: 'personal-details',
}

const baseEmailAddressTextFieldData = {
  fieldName: 'emailAddress',
  successFlashFieldName: 'Email address',
  hintText: 'For example name@email.co.uk',
  redirectAnchor: 'phones-and-emails',
  inputClasses: 'govuk-!-width-one-third',
  submitButtonText: 'Save and return to profile',
}

export const changeEmailAddressTextFieldData = (
  id: string,
  {
    name,
  }: {
    name: { firstName: string; lastName: string }
  },
): TextFieldData => ({
  ...baseEmailAddressTextFieldData,
  url: `change-email-address/${id}`,
  pageTitle: `Change this person’s email address`,
  formTitle: `Change ${formatName(name.firstName, '', name.lastName, { style: NameFormatStyle.firstLast })}’s email address`,
  auditEditPageLoad: Page.EditEmailAddress,
  auditEditPostAction: PostAction.EditEmailAddress,
})

export const addEmailAddressTextFieldData = ({
  name,
}: {
  name: { firstName: string; lastName: string }
}): TextFieldData => ({
  ...baseEmailAddressTextFieldData,
  url: `add-email-address`,
  pageTitle: `Add this person’s email address`,
  formTitle: `Add ${formatName(name.firstName, '', name.lastName, { style: NameFormatStyle.firstLast })}’s email address`,
  auditEditPageLoad: Page.AddEmailAddress,
  auditEditPostAction: PostAction.AddEmailAddress,
})

const basePhoneNumberFieldData = {
  fieldName: 'phoneNumber',
  redirectAnchor: 'phones-and-emails',
  successFlashFieldName: 'Phone number',
}

export const addPhoneNumberFieldData = (name: { firstName: string; lastName: string }): FieldData => ({
  ...basePhoneNumberFieldData,
  auditEditPageLoad: Page.AddPhoneNumber,
  auditEditPostAction: PostAction.AddPhoneNumber,
  formTitle: `Add ${formatName(name.firstName, '', name.lastName, { style: NameFormatStyle.firstLast })}’s phone number`,
  pageTitle: `Add this person’s phone number`,
  url: `add-phone-number`,
})

export const changePhoneNumberFieldData = (id: string, name: { firstName: string; lastName: string }): FieldData => ({
  ...basePhoneNumberFieldData,
  auditEditPageLoad: Page.EditPhoneNumber,
  auditEditPostAction: PostAction.EditPhoneNumber,
  formTitle: `Change ${formatName(name.firstName, '', name.lastName, { style: NameFormatStyle.firstLast })}’s phone number`,
  pageTitle: `Change this person’s phone number`,
  url: `change-phone-number/${id}`,
})
