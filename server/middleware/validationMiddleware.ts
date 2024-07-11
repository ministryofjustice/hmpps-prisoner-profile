import { Request, RequestHandler } from 'express'
import HmppsError from '../interfaces/HmppsError'

export type Validator = (body: Record<string, string>) => HmppsError[] | Promise<HmppsError[]>

export default function validationMiddleware(
  validators: Validator[],
  options: {
    redirectOnError: boolean
    redirectPath?: string
    onError?: (req: Request) => void
  } = { redirectOnError: false },
): RequestHandler {
  return async (req, res, next) => {
    const validationResults = await Promise.all(validators.map(validator => validator(req.body)))
    const errors = validationResults.flat()

    if (options.redirectOnError) {
      if (options.onError) options.onError(req)
      req.flash('errors', errors)
      res.redirect(options.redirectPath)
    }

    if (errors.length) {
      req.errors = errors
    }
    return next()
  }
}
