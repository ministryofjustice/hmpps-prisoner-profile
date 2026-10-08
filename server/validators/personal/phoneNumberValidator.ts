import HmppsError from '../../interfaces/HmppsError'

const phoneNumberInvalidCharacterChecker = /[^\d() ]/
const phoneExtensionInvalidCharacterChecker = /[^\d]/

export const phoneNumberValidator = (body: Record<string, string>): HmppsError[] => {
  const indexes = Object.keys(body)
    .map(key => key.match(/^phoneNumber(?:Type|Extension)?(\d+)$/)?.[1])
    .filter((index): index is string => index !== undefined)
    .map(Number)

  if (indexes.length) {
    return Array.from({ length: Math.max(...indexes) + 1 }, (_, index) =>
      phoneNumberValidator({
        phoneNumberType: body[`phoneNumberType${index}`] ?? '',
        phoneNumber: body[`phoneNumber${index}`] ?? '',
        phoneExtension: body[`phoneExtension${index}`] ?? '',
      }).map(error => (error.href ? { ...error, href: `${error.href}-${index}` } : error)),
    ).flat()
  }

  const { phoneNumberType, phoneNumber, phoneExtension } = body
  const errors: HmppsError[] = []

  if (!phoneNumberType) {
    return [{ text: 'Select a phone number type', href: '#phone-number-type' }]
  }

  errors.push(...validateMandatoryPhoneNumber('#phone-number', 'Phone number', phoneNumber))

  if (phoneExtension) {
    if (phoneExtension.match(phoneExtensionInvalidCharacterChecker)) {
      errors.push({ text: 'Extension must only contain numbers', href: '#phone-extension' })
    } else if (phoneExtension.length > 7) {
      errors.push({ text: 'Extension must be 7 characters or less', href: '#phone-extension' })
    }
  }

  return errors
}

export const validateMandatoryPhoneNumber = (href: string, label: string, phoneNumber: string): HmppsError[] => {
  if (!phoneNumber?.trim()) {
    return [{ href, text: `Enter a ${label.toLowerCase()}` }]
  }

  return validatePhoneNumber(href, label, phoneNumber)
}

export const validatePhoneNumber = (href: string, label: string, phoneNumber: string): HmppsError[] => {
  if (phoneNumber.match(phoneNumberInvalidCharacterChecker)) {
    return [{ text: `${label}s must only contain numbers or brackets`, href }]
  }
  if (phoneNumber.length > 40) {
    return [{ text: `${label} must be 40 characters or less`, href }]
  }

  return []
}

export const validateExtensionNumber = (href: string, label: string, extensionNumber: string): HmppsError[] => {
  if (extensionNumber.match(phoneExtensionInvalidCharacterChecker)) {
    return [{ text: `${label} must only contain numbers`, href }]
  }
  if (extensionNumber.length > 7) {
    return [{ text: `${label} must be 7 characters or less`, href }]
  }

  return []
}
