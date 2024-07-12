import { Request, RequestHandler, Response } from 'express'
import HmppsError from '../interfaces/HmppsError'
import { hasLength } from '../utils/utils'

export type Validator = (body: Record<string, string>) => HmppsError[] | Promise<HmppsError[]>

export default function validationMiddleware(
  validators: Validator[],
  onError?: (req: Request, res: Response) => void,
): RequestHandler {
  return async (req, res, next) => {
    const validationResults = await Promise.all(validators.map(validator => validator(req.body)))
    const errors = validationResults.flat()

    if (hasLength(errors) && onError) {
      req.flash('errors', errors)
      return onError(req, res)
    }

    if (errors.length) {
      req.errors = errors
    }
    return next()
  }
}
