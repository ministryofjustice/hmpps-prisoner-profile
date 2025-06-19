import HmppsError from '../../interfaces/HmppsError'

export const phoneNumberValidator = (body: Record<string, string>): HmppsError[] => {
  const { phoneNumberType, phoneNumber, phoneExtension } = body
  const errors: HmppsError[] = []

  if (!phoneNumberType) {
    errors.push({ text: 'Select a phone number type', href: '#phone-number-type' })
  }

  const phoneNumberInvalidCharacterChecker = /[^\d() ]/
  if (!phoneNumber) {
    errors.push({ text: 'Enter a phone number', href: '#phone-number' })
  } else if (phoneNumber.match(phoneNumberInvalidCharacterChecker)) {
    errors.push({ text: 'Phone numbers must only contain numbers or brackets', href: '#phone-number' })
  } else if (phoneNumber.length > 40) {
    errors.push({ text: 'Phone number must be 40 characters or less', href: '#phone-number' })
  }

  if (phoneExtension) {
    const phoneExtensionInvalidCharacterChecker = /[^\d]/
    if (phoneExtension.match(phoneExtensionInvalidCharacterChecker)) {
      errors.push({ text: 'Extension must only contain numbers', href: '#phone-extension' })
    } else if (phoneExtension.length > 7) {
      errors.push({ text: 'Extension must be 7 characters or less', href: '#phone-extension' })
    }
  }

  return errors
}
