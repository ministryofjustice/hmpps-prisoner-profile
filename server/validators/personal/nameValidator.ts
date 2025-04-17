import { Validator } from '../../middleware/validationMiddleware'
import HmppsError from '../../interfaces/HmppsError'

export const nameValidator: Validator = (body: Record<string, string>) => {
  const { firstName, middleName1, middleName2, lastName } = body
  return [
    ...validateMandatoryName('#firstName', 'First name', firstName),
    ...validateName('#middleName1', 'Middle name', middleName1),
    ...validateName('#middleName2', 'Second middle name', middleName2),
    ...validateMandatoryName('#lastName', 'Last name', lastName),
  ]
}

export const validateMandatoryName = (href: string, label: string, name: string): HmppsError[] => {
  if (!name.trim()) {
    return [{ href, text: `Enter this person’s ${label.toLowerCase()}` }]
  }

  return validateName(href, label, name)
}

export const validateName = (href: string, label: string, name: string): HmppsError[] => {
  if (name.length > 35) {
    return [{ href, text: `${label} must be 35 characters or less` }]
  }

  if (!/^[A-Z|a-z ,.'-]*$/.test(name)) {
    return [
      {
        href,
        text: `${label} must only include letters a to z, and special characters such as hyphens, spaces, commas and apostrophes`,
      },
    ]
  }

  return []
}
