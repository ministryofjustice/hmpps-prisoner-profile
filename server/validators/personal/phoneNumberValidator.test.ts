import { phoneNumberValidator } from './phoneNumberValidator'

describe('Phone number validator', () => {
  const validRequest = { phoneNumberType: 'MOB', phoneNumber: '1234', phoneExtension: '321' }

  it.each([
    validRequest,
    { ...validRequest, phoneExtension: undefined },
    { ...validRequest, phoneNumber: '(1234) 123 123 123' },
  ])('Valid: %s', async body => {
    const errors = phoneNumberValidator(body)
    expect(errors.length).toEqual(0)
  })

  it.each([
    [{ ...validRequest, phoneNumberType: undefined }, 'Select a phone number type', '#phone-number-type'],
    [{ ...validRequest, phoneNumber: undefined }, 'Enter a phone number', '#phone-number'],
    [
      { ...validRequest, phoneNumber: `${'1'.repeat(40)}1` },
      'Phone number must be 40 characters or less',
      '#phone-number',
    ],
    [
      { ...validRequest, phoneNumber: 'ABC123' },
      'Phone numbers must only contain numbers or brackets',
      '#phone-number',
    ],
    [
      { ...validRequest, phoneExtension: `${'1'.repeat(7)}1` },
      'Extension must be 7 characters or less',
      '#phone-extension',
    ],
    [{ ...validRequest, phoneExtension: 'ABC123' }, 'Extension must only contain numbers', '#phone-extension'],
  ])('Validations: %s: %s', async (body, errorMessage: string, errorHref: string) => {
    const errors = phoneNumberValidator(body)

    expect(errors.length).toEqual(1)
    expect(errors[0].text).toEqual(errorMessage)
    expect(errors[0].href).toEqual(errorHref)
  })
})
