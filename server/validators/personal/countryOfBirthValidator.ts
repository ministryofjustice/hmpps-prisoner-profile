import { Validator } from '../../middleware/validationMiddleware'

export const countryOfBirthValidator: Validator = (body: Record<string, string>) => {
  const { radioField, autocompleteField, autocompleteError } = body
  const errors = []

  if (radioField === 'OTHER' && !autocompleteField && !autocompleteError) {
    errors.push({ href: '#autocomplete', text: 'Enter country name' })
  }

  if (radioField === 'OTHER' && autocompleteError) {
    errors.push({ text: 'This is not a valid country', href: '#autocomplete' })
  }

  return errors
}

export default { countryOfBirthValidator }
