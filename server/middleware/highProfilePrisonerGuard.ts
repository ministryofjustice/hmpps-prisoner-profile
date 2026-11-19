import type { RequestHandler } from 'express'
import NotFoundError from '../utils/notFoundError'
import isGlobalHighPriorityPrisoner from '../utils/isGlobalHighPriorityPrisoner'

// TODO: This will likely disappear once folded into the permissions library
export function highProfilePrisonerGuard(): RequestHandler {
  return (_req, _res, next) => {
    if (!isGlobalHighPriorityPrisoner()) {
      return next()
    }

    return next(new NotFoundError('User is not allowed to access this page'))
  }
}

export default { highProfilePrisonerGuard }
