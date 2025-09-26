import { Validator } from '../../middleware/validationMiddleware'

export const nationalityValidator: Validator = (body: Record<string, string>) => {
  const { radioField, autocompleteField, autocompleteError, additionalNationalities } = body
  const errors = []

  if (radioField === 'OTHER' && !autocompleteField && !autocompleteError) {
    errors.push({ href: '#autocomplete', text: 'Enter nationality' })
  }

  if (radioField === 'OTHER' && autocompleteError) {
    errors.push({ text: 'This is not a valid nationality', href: '#autocomplete' })
  }

  if (additionalNationalities?.length > 40) {
    errors.push({ href: '#additional-nationalities', text: 'Additional nationalities must be 40 characters or less' })
  }

  return errors
}

export default { nationalityValidator }
