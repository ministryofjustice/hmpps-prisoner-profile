import { Request } from 'express'
import { Validator } from '../../middleware/validationMiddleware'

export const notEmptyValidator =
  (options: {
    fieldName: string
    href: string
    errorText?: string
    getErrorText?: (req: Request) => string
  }): Validator =>
  (req: Request) => {
    const { fieldName, href, errorText, getErrorText } = options
    const fieldValue = req.body[fieldName]
    const error = [{ text: errorText || getErrorText(req), href }]

    if (Array.isArray(fieldValue)) return fieldValue.length > 0 ? [] : error

    return fieldValue?.trim()?.length > 0 ? [] : error
  }
