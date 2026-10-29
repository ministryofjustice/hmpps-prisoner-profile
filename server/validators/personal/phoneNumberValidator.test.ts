import { phoneNumberValidator, validatePhoneNumberDuplicate } from './phoneNumberValidator'

describe('Phone number validator', () => {
  const validRequest = { phoneNumberType: 'MOB', phoneNumber: '1234', phoneExtension: '321' }

  it.each([
    validRequest,
    { ...validRequest, phoneExtension: undefined },
    { ...validRequest, phoneNumber: '(1234)123123123' },
    { ...validRequest, phoneNumber: '  +12345678901  ' },
    { ...validRequest, phoneNumber: ' 07700  000000 ' },
    { ...validRequest, phoneExtension: ' 3  21 ' },
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
      'Phone numbers must only contain numbers or brackets, or a plus sign (+) at the start of the number',
      '#phone-number',
    ],
    [
      { ...validRequest, phoneExtension: `${'1'.repeat(7)}1` },
      'Extension must be 7 characters or less',
      '#phone-extension',
    ],
    [{ ...validRequest, phoneExtension: 'ABC123' }, 'Extension must only contain numbers', '#phone-extension'],
    [{ ...validRequest, phoneExtension: '(321)' }, 'Extension must only contain numbers', '#phone-extension'],
  ])('Validations: %s: %s', async (body, errorMessage: string, errorHref: string) => {
    const errors = phoneNumberValidator(body)

    expect(errors.length).toEqual(1)
    expect(errors[0].text).toEqual(errorMessage)
    expect(errors[0].href).toEqual(errorHref)
  })

  it('returns errors for both a missing type and a missing phone number', () => {
    expect(phoneNumberValidator({ phoneNumberType: '', phoneNumber: '', phoneExtension: '' })).toEqual([
      { text: 'Select a phone number type', href: '#phone-number-type' },
      { href: '#phone-number', text: 'Enter a phone number' },
    ])
  })

  it('returns both length and accepted-character errors', () => {
    expect(phoneNumberValidator({ ...validRequest, phoneNumber: `${'1'.repeat(40)}a` })).toEqual([
      { text: 'Phone number must be 40 characters or less', href: '#phone-number' },
      {
        text: 'Phone numbers must only contain numbers or brackets, or a plus sign (+) at the start of the number',
        href: '#phone-number',
      },
    ])
  })

  it('validates indexed phone number fields', () => {
    expect(
      phoneNumberValidator({
        phoneNumberType0: 'MOB',
        phoneNumber0: '1234',
        phoneExtension0: '',
        phoneNumberType1: 'HOME',
        phoneNumber1: '1+234',
        phoneExtension1: '',
      }),
    ).toEqual([
      {
        text: 'Phone numbers must only contain numbers or brackets, or a plus sign (+) at the start of the number',
        href: '#phone-number-1',
      },
    ])
  })

  it.each([
    [
      'global',
      0,
      '#phone-number',
      'This phone number already exists for this person. Add a new number or edit the saved one',
    ],
    [
      'address',
      2,
      '#phone-number-2',
      'This phone number already exists for this address. Add a new number or edit the saved one',
    ],
  ] as const)('returns the duplicate error for %s phone numbers', (context, index, href, text) => {
    expect(validatePhoneNumberDuplicate('01234 567890', '', [{ number: '(01234)567890' }], context, index)).toEqual([
      { href, text },
    ])
  })

  it.each(['1+234', '++1234'])('rejects an invalid plus in %s', phoneNumber => {
    expect(phoneNumberValidator({ ...validRequest, phoneNumber })).toContainEqual({
      text: 'Phone numbers must only contain numbers or brackets, or a plus sign (+) at the start of the number',
      href: '#phone-number',
    })
  })
})
