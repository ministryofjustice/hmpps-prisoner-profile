import {
  nextOfKinValidator,
  validateAutocomplete,
  validateContactType,
  validateFieldLength,
  validateRelationshipType,
} from './nextOfKinValidator'
import HmppsError from '../../interfaces/HmppsError'
import { NextOfKinSubmission } from '../../controllers/nextOfKinController'

describe('Next of Kin Validator', () => {
  describe('validateContactType', () => {
    it.each([
      ['#contactType', ['nextOfKin'], []],
      ['#contactType', 'emergencyContact', []],
      ['#contactType', ['nextOfKin', 'emergencyContact'], []],
      [
        '#contactType',
        undefined,
        [{ href: '#contactType', text: 'Select if the contact is a next of kin or an emergency contact' }],
      ],
      [
        '#contactType',
        '',
        [{ href: '#contactType', text: 'Select if the contact is a next of kin or an emergency contact' }],
      ],
    ])('href: %s, contactType: %s', (href, contactType, expectedErrors) => {
      const errors = validateContactType(href, contactType)
      expect(errors).toEqual(expectedErrors)
    })
  })

  describe('validateFieldLength', () => {
    it.each([
      // Valid cases
      ['#field', 'Field', 'value', 10, true, []],
      ['#field', 'Field', 'value', 10, false, []],
      ['#field', 'Field', '', 10, false, []],
      // Required field missing
      ['#field', 'Field', '', 10, true, [{ href: '#field', text: 'Enter a value for field' }]],
      ['#field', 'Field', '   ', 10, true, [{ href: '#field', text: 'Enter a value for field' }]],
      // Field too long
      ['#field', 'Field', 'value too long', 5, false, [{ href: '#field', text: 'Field must be 5 characters or less' }]],
      ['#field', 'Field', 'value too long', 5, true, [{ href: '#field', text: 'Field must be 5 characters or less' }]],
    ])(
      'href: %s, label: %s, value: %s, maxLength: %s, isRequired: %s',
      (href, label, val, maxLength, isRequired, expectedErrors) => {
        const errors = validateFieldLength(href, label, val, maxLength, isRequired)
        expect(errors).toEqual(expectedErrors)
      },
    )
  })

  describe('validateRelationshipType', () => {
    it.each([
      // Valid case
      ['#relationshipTypeId', 'S_SIS', undefined, []],
      // Invalid value
      [
        '#relationshipTypeId',
        undefined,
        'invalid',
        [
          {
            href: '#relationshipTypeId',
            text: 'We could not find a matching relationship. Check the spelling or try typing something else',
          },
        ],
      ],
      // Missing value
      ['#relationshipTypeId', '', undefined, [{ href: '#relationshipTypeId', text: 'Enter relationship' }]],
      ['#relationshipTypeId', undefined, undefined, [{ href: '#relationshipTypeId', text: 'Enter relationship' }]],
    ])(
      'href: %s, relationshipTypeId: %s, invalidValue: %s',
      (href, relationshipTypeId, invalidValue, expectedErrors) => {
        const errors = validateRelationshipType(href, relationshipTypeId, invalidValue)
        expect(errors).toEqual(expectedErrors)
      },
    )
  })

  describe('validateAutocomplete', () => {
    it.each([
      // Valid case
      ['#cityCode', 'Town or city', undefined, []],
      // Invalid value
      ['#cityCode', 'Town or city', 'invalid', [{ href: '#cityCode', text: 'This is not a valid town or city' }]],
    ])('href: %s, type: %s, invalidValue: %s', (href, type, invalidValue, expectedErrors) => {
      const errors = validateAutocomplete(href, type, invalidValue)
      expect(errors).toEqual(expectedErrors)
    })
  })

  describe('nextOfKinValidator', () => {
    it('should validate all fields correctly when all fields are valid', () => {
      const body = {
        contactType: ['nextOfKin'],
        firstName: 'John',
        middleNames: 'Middle',
        lastName: 'Doe',
        'dateOfBirth-day': '01',
        'dateOfBirth-month': '01',
        'dateOfBirth-year': '1980',
        phoneNumber: '07700900000',
        property: '123',
        street: 'Test Street',
        postcode: 'AB12 3CD',
        relationshipTypeId: 'S_SIS',
      }

      const errors = nextOfKinValidator(body)
      expect(errors).toEqual([])
    })

    it('should return errors when required fields are missing', () => {
      const body = {
        firstName: '',
        middleNames: '',
        lastName: '',
        'dateOfBirth-day': '',
        'dateOfBirth-month': '',
        'dateOfBirth-year': '',
        phoneNumber: '',
        property: '',
        street: '',
        postcode: '',
        relationshipTypeId: '',
      }

      const errors = nextOfKinValidator(body) as HmppsError[]

      // Check that we have the expected number of errors
      // We expect errors for contactType, firstName, lastName, and relationshipTypeId
      expect(errors.length).toBe(4)

      // Check for specific errors by href
      expect(errors.some(error => error.href === '#contactType')).toBe(true)
      expect(errors.some(error => error.href === '#firstName')).toBe(true)
      expect(errors.some(error => error.href === '#lastName')).toBe(true)
      expect(errors.some(error => error.href === '#relationshipTypeId')).toBe(true)

      // Check that we have error messages containing specific substrings
      const errorTexts = errors.map(error => error.text)
      expect(errorTexts.some(text => text.includes('next of kin'))).toBe(true)
      expect(errorTexts.some(text => text.includes('first name'))).toBe(true)
      expect(errorTexts.some(text => text.includes('last name'))).toBe(true)
      expect(errorTexts.some(text => text.includes('relationship'))).toBe(true)
    })

    it('should validate field lengths correctly', () => {
      const body: NextOfKinSubmission = {
        contactType: 'nextOfKin',
        firstName: 'John',
        middleNames: '',
        lastName: 'Doe',
        'dateOfBirth-day': '01',
        'dateOfBirth-month': '01',
        'dateOfBirth-year': '1980',
        phoneNumber: {
          type: 'BUS',
          numbers: {
            business: {
              number: '0'.repeat(41),
              extension: '0'.repeat(8),
            },
          },
        },
        property: 'a'.repeat(51),
        street: 'a'.repeat(161),
        postcode: 'a'.repeat(13),
        relationshipTypeId: 'S_SIS',
      }

      const errors = nextOfKinValidator(body)

      // Check specific errors
      expect(errors).toContainEqual({
        href: '#phoneNumber-business-number',
        text: 'Phone number must be 40 characters or less',
      })
      expect(errors).toContainEqual({
        href: '#phoneNumber-business-extension',
        text: 'Extension number must be 7 characters or less',
      })
      expect(errors).toContainEqual({
        href: '#property',
        text: 'House name or number must be 50 characters or less',
      })
      expect(errors).toContainEqual({
        href: '#street',
        text: 'Street must be 160 characters or less',
      })
      expect(errors).toContainEqual({
        href: '#postcode',
        text: 'Postcode must be 12 characters or less',
      })
    })

    it.each([
      ['BUS', 'business'],
      ['HOME', 'home'],
      ['MOB', 'mobile'],
    ])('should validate phone numbers correctly', (type: string, formvalue: string) => {
      const body: NextOfKinSubmission = {
        contactType: 'nextOfKin',
        firstName: 'John',
        middleNames: '',
        lastName: 'Doe',
        'dateOfBirth-day': '01',
        'dateOfBirth-month': '01',
        'dateOfBirth-year': '1980',
        phoneNumber: {
          type,
          numbers: {
            [formvalue]: {
              number: 'ABC123',
              extension: 'ABC123',
            },
          },
        },
        property: '',
        street: '',
        postcode: '',
        relationshipTypeId: 'S_SIS',
      }

      const errors = nextOfKinValidator(body)

      // Check specific errors
      expect(errors).toContainEqual({
        href: `#phoneNumber-${formvalue}-number`,
        text: 'Phone numbers must only contain numbers or brackets',
      })
      expect(errors).toContainEqual({
        href: `#phoneNumber-${formvalue}-extension`,
        text: 'Extension numbers must only contain numbers',
      })
    })

    it('should require a phone number if a phone number type is selected', () => {
      const body: NextOfKinSubmission = {
        contactType: 'nextOfKin',
        firstName: 'John',
        middleNames: '',
        lastName: 'Doe',
        'dateOfBirth-day': '01',
        'dateOfBirth-month': '01',
        'dateOfBirth-year': '1980',
        phoneNumber: {
          type: 'BUS',
          numbers: {
            business: {},
          },
        },
        property: '',
        street: '',
        postcode: '',
        relationshipTypeId: 'S_SIS',
      }

      const errors = nextOfKinValidator(body)

      // Check specific errors
      expect(errors).toContainEqual({
        href: '#phoneNumber-business-number',
        text: 'Enter a phone number',
      })
    })

    it('should validate autocomplete fields correctly', () => {
      const body = {
        contactType: ['nextOfKin'],
        firstName: 'John',
        middleNames: '',
        lastName: 'Doe',
        'dateOfBirth-day': '01',
        'dateOfBirth-month': '01',
        'dateOfBirth-year': '1980',
        phoneNumber: '07700900000',
        property: '123',
        street: 'Test Street',
        cityCodeError: 'invalid',
        postcode: 'AB12 3CD',
        relationshipTypeIdError: 'invalid',
      }

      const errors = nextOfKinValidator(body)

      // Check specific errors
      expect(errors).toContainEqual({
        href: '#cityCode',
        text: 'This is not a valid town or city',
      })
      expect(errors).toContainEqual({
        href: '#relationshipTypeId',
        text: 'We could not find a matching relationship. Check the spelling or try typing something else',
      })
    })
  })
})
