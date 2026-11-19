import type { RequestHandler } from 'express'
import NotFoundError from '../utils/notFoundError'

// TODO: This will likely disappear once folded into the permissions library
export function highProfilePrisonerGuard(): RequestHandler {
  return (_req, res, next) => {
    if (res.locals.isHighProfilePrisonerOutsideCaseloads) {
      next(new NotFoundError('User is not allowed to access this page'))
      return
    }

    next()
  }
}

export default { highProfilePrisonerGuard }
