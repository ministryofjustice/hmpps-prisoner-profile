import HmppsError from '../../interfaces/HmppsError'
import { Validator } from '../../middleware/validationMiddleware'

export const radioFieldValidator =
  ({ fieldName, fieldDisplayName }: { fieldName: string; fieldDisplayName: string }): Validator =>
  (body: Record<string, string>): HmppsError[] => {
    const value = body[fieldName]

    if (!value) {
      return [{ text: `Select ${fieldDisplayName}.`, href: `#${fieldName}` }]
    }
    return []
  }
