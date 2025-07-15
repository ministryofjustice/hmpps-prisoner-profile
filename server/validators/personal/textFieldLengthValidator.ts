import { Validator } from '../../middleware/validationMiddleware'

export const textFieldLengthValidator =
  ({ fieldName, displayName, maxLength }: { fieldName: string; displayName: string; maxLength: number }): Validator =>
  (body: Record<string, string>) => {
    const value = body[fieldName]

    if (value.length > maxLength) {
      return [{ text: `${displayName} must be ${maxLength} characters or less.`, href: `#${fieldName}` }]
    }

    return []
  }
