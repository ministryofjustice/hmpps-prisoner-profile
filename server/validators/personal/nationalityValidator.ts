import { Validator } from '../../middleware/validationMiddleware'

export const nationalityValidator: Validator = (body: Record<string, string>) => {
  const { radioField, autocompleteField, additionalNationalities } = body
  const errors = []

  if (!autocompleteField && ['OTHER', 'OTHER__VALIDATION_ERROR'].includes(radioField)) {
    const validationText = radioField === 'OTHER' ? 'Enter nationality' : 'This is not a valid nationality'
    errors.push({ href: '#autocomplete', text: validationText })
  }

  if (additionalNationalities?.length > 40) {
    errors.push({ href: '#additional-nationalities', text: 'Additional nationalities must be 40 characters or less' })
  }

  return errors
}
