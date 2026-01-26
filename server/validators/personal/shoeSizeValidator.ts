import { Validator } from '../../middleware/validationMiddleware'

export const shoeSizeValidator: Validator = (body: Record<string, string>) => {
  if (body.autocompleteError) {
    return [{ text: 'This is not a valid shoe size', href: '#autocomplete' }]
  }

  return []
}

export default { shoeSizeValidator }
