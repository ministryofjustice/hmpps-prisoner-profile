import { Validator } from '../../middleware/validationMiddleware'
import { validateMandatoryName, validateName } from './nameValidator'
import HmppsError from '../../interfaces/HmppsError'
import { validateDate } from './dateValidator'
import { validateExtensionNumber, validateMandatoryPhoneNumber } from './phoneNumberValidator'
import { PhoneNumberTypeMappings } from '../../data/constants/phoneNumberMappings'
import { NextOfKinPhoneNumberSubmission, NextOfKinSubmission } from '../../controllers/nextOfKinController'

export const nextOfKinValidator: Validator = (body: NextOfKinSubmission): HmppsError[] => {
  const {
    contactType,
    firstName,
    middleNames,
    lastName,
    'dateOfBirth-day': dateOfBirthDay,
    'dateOfBirth-month': dateOfBirthMonth,
    'dateOfBirth-year': dateOfBirthYear,
    phoneNumber,
    property,
    street,
    cityCodeError,
    postcode,
    relationshipTypeId,
    relationshipTypeIdError,
  } = body
  return [
    ...validateContactType('#contactType', contactType),
    ...validateMandatoryName('#firstName', 'First name', firstName),
    ...validateName('#middleNames', 'Middle names', middleNames),
    ...validateMandatoryName('#lastName', 'Last name', lastName),
    ...validateDate(
      dateOfBirthDay,
      dateOfBirthMonth,
      dateOfBirthYear,
      'dateOfBirth',
      'Date of birth',
      'Date of birth must include a day, month and year',
      true,
      false,
    ),
    ...validatePhoneNumbers(phoneNumber),
    ...validateFieldLength('#property', 'House name or number', property, 50, false),
    ...validateFieldLength('#street', 'Street', street, 160, false),
    ...validateAutocomplete('#cityCode', 'Town or city', cityCodeError),
    ...validateFieldLength('#postcode', 'Postcode', postcode, 12, false),
    ...validateRelationshipType('#relationshipTypeId', relationshipTypeId, relationshipTypeIdError),
  ]
}

export const validateContactType = (href: string, contactType: string[] | string): HmppsError[] => {
  if (!contactType) {
    return [{ href, text: 'Select if the contact is a next of kin or an emergency contact' }]
  }
  return []
}

export const validateFieldLength = (
  href: string,
  label: string,
  val: string,
  maxLength: number,
  isRequired: boolean,
): HmppsError[] => {
  if (isRequired && !val.trim()) {
    return [{ href, text: `Enter a value for ${label.toLowerCase()}` }]
  }
  if (val && val.length > maxLength) {
    return [{ href, text: `${label} must be ${maxLength} characters or less` }]
  }
  return []
}

export const validateRelationshipType = (
  href: string,
  relationshipTypeId: string,
  invalidValue: string,
): HmppsError[] => {
  if (invalidValue) {
    return [
      {
        text: `We could not find a matching relationship. Check the spelling or try typing something else`,
        href,
      },
    ]
  }
  if (!relationshipTypeId) {
    return [{ href, text: 'Enter relationship' }]
  }
  return []
}

export const validatePhoneNumbers = (phoneNumber: NextOfKinPhoneNumberSubmission): HmppsError[] => {
  if (!phoneNumber?.type || phoneNumber.type === 'NONE') {
    return []
  }

  const { type } = phoneNumber
  const { formValue } = PhoneNumberTypeMappings[type]
  const numberToValidate = phoneNumber?.numbers?.[formValue]

  const numberErrors =
    validateMandatoryPhoneNumber(`#phoneNumber-${formValue}-number`, 'Phone number', numberToValidate.number) ?? []
  const extensionErrors =
    (numberToValidate?.extension &&
      validateExtensionNumber(`#phoneNumber-${formValue}-extension`, 'Extension', numberToValidate.extension)) ??
    []

  return [...numberErrors, ...extensionErrors]
}

export const validateAutocomplete = (href: string, type: string, invalidValue: string) => {
  return invalidValue
    ? [
        {
          text: `This is not a valid ${type.toLowerCase()}`,
          href,
        },
      ]
    : []
}
