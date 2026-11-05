import HmppsError from '../../interfaces/HmppsError'

export const phoneNumberValidator = (body: Record<string, string>): HmppsError[] => {
  const indexes = Object.keys(body)
    .map(key => key.match(/^phoneNumber(?:Type|Extension)?(\d+)$/)?.[1])
    .filter((index): index is string => index !== undefined)
    .map(Number)

  if (!indexes.length) {
    return validatePhoneNumberFields(body.phoneNumberType, body.phoneNumber, body.phoneExtension)
  }

  return Array.from({ length: Math.max(...indexes) + 1 }, (_, index) =>
    validatePhoneNumberFields(
      body[`phoneNumberType${index}`],
      body[`phoneNumber${index}`],
      body[`phoneExtension${index}`],
      index,
    ),
  ).flat()
}

const validatePhoneNumberFields = (
  phoneNumberType: string,
  phoneNumber: string,
  phoneExtension: string,
  index?: number,
): HmppsError[] => {
  const hrefSuffix = index === undefined ? '' : `-${index}`
  const phoneNumberHref = `#phone-number${hrefSuffix}`
  const phoneExtensionHref = `#phone-extension${hrefSuffix}`
  const normalisedPhoneNumber = normalisePhoneNumber(phoneNumber)
  const normalisedExtension = normalisePhoneExtension(phoneExtension)
  const errors: HmppsError[] = []

  if (!phoneNumberType) errors.push({ text: 'Select a phone number type', href: `#phone-number-type${hrefSuffix}` })

  if (!normalisedPhoneNumber || normalisedPhoneNumber === '+') {
    errors.push({ href: phoneNumberHref, text: 'Enter a phone number' })
  } else {
    if (normalisedPhoneNumber.length > 40) {
      errors.push({ text: 'Phone number must be 40 characters or less', href: phoneNumberHref })
    }
    if (!/^\+?\d[\d ]*$/.test(normalisedPhoneNumber)) {
      errors.push({
        text: 'Phone numbers must only contain numbers or brackets, or a plus sign (+) at the start of the number',
        href: phoneNumberHref,
      })
    }
  }

  if (/[^\d ]/.test(normalisedExtension)) {
    errors.push({ text: 'Extension must only contain numbers', href: phoneExtensionHref })
  }
  if (normalisedExtension.length > 7) {
    errors.push({ text: 'Extension must be 7 characters or less', href: phoneExtensionHref })
  }

  return errors
}

export const validatePhoneNumberDuplicate = (
  phoneNumber: string,
  extension: string | null | undefined,
  existingPhoneNumbers: ExistingPhoneNumber[],
  context: 'global' | 'address',
  index = 0,
): HmppsError[] => {
  const duplicateKey = phoneNumberDuplicateKey(phoneNumber, extension)
  if (
    !existingPhoneNumbers.some(
      existingPhoneNumber =>
        phoneNumberDuplicateKey(existingPhoneNumber.number, existingPhoneNumber.extension) === duplicateKey,
    )
  ) {
    return []
  }

  return [
    {
      href: context === 'global' ? '#phone-number' : `#phone-number-${index}`,
      text: `This phone number already exists for this ${context === 'global' ? 'person' : 'address'}. Add a new number or edit the saved one`,
    },
  ]
}

export const normalisePhoneNumber = (phoneNumber: string = ''): string => phoneNumber.trim().replace(/[()]/g, '')

export const normalisePhoneExtension = (extension: string | null = ''): string => (extension ?? '').trim()

type ExistingPhoneNumber = { number: string; extension?: string | null }

const phoneNumberDuplicateKey = (phoneNumber: string, extension?: string | null): string =>
  JSON.stringify([
    normalisePhoneNumber(phoneNumber).replace(/\s/g, ''),
    normalisePhoneExtension(extension).replace(/\s/g, ''),
  ])

export const phoneNumberForStorage = (phoneNumber: string): string => {
  const normalisedPhoneNumber = normalisePhoneNumber(phoneNumber)
  const elevenDigitNumber = normalisedPhoneNumber.match(/^(\+?)(\d{11})$/)

  return elevenDigitNumber
    ? `${elevenDigitNumber[1]}${elevenDigitNumber[2].slice(0, 5)} ${elevenDigitNumber[2].slice(5)}`
    : normalisedPhoneNumber
}
