import { RequestHandler } from 'express'
import HmppsError from '../interfaces/HmppsError'
import { hasLength } from '../utils/utils'

export type Validator = (body: Record<string, string>) => HmppsError[] | Promise<HmppsError[]>

export default function validationMiddleware(
  validators: Validator[],
  options: { redirectBackOnError: boolean; redirectTo?: string } = {
    redirectBackOnError: false,
  },
): RequestHandler {
  return async (req, res, next) => {
    const validationResults = await Promise.all(validators.map(validator => validator(req.body)))
    const errors = validationResults.flat()
    if (hasLength(errors) && options.redirectBackOnError) {
      req.flash('requestBody', JSON.stringify(req.body))
      req.flash('errors', errors)
      if (options.redirectTo) {
        return res.redirect(`/prisoner/${req.params.prisonerNumber}/${options.redirectTo}`)
      }
      return res.redirect(req.originalUrl)
    }

    if (errors.length) {
      req.errors = errors
    }
    return next()
  }
}
