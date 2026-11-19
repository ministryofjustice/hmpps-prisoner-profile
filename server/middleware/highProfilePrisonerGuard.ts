import { NextFunction, Request, Response } from 'express'
import NotFoundError from '../utils/notFoundError'
import { HmppsStatusCode } from '../data/enums/hmppsStatusCode'
import isGlobalHighPriorityPrisoner from '../utils/isGlobalHighPriorityPrisoner'

// TODO: This will likely disappear once folded into the permissions library
export function highProfilePrisonerGuard() {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!isGlobalHighPriorityPrisoner()) {
      return next()
    }

    return next(new NotFoundError(`User is not allowed to access this page`, HmppsStatusCode.NOT_FOUND))
  }
}

export default { highProfilePrisonerGuard }
