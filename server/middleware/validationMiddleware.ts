import { RequestHandler } from 'express'
import { HmppsError } from '../interfaces/hmppsError'

export type Validator = (body: Record<string, string>) => HmppsError[] | Promise<HmppsError[]>

export default function validationMiddleware(...validators: Validator[]): RequestHandler {
  return async (req, res, next) => {
    const validationResults = await Promise.all(validators.map(validator => validator(req.body)))
    const errors = validationResults.flat()
    if (errors.length) {
      req.errors = errors
    }
    return next()
  }
}
