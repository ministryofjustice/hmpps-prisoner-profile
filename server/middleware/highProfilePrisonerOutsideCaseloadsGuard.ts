import type { RequestHandler } from 'express'
import config from '../config'
import NotFoundError from '../utils/notFoundError'
import isHighProfilePrisonerOutsideCaseloads from '../utils/isHighProfilePrisonerOutsideCaseloads'

/** Prevents access to high profile prisoners outside user’s caseloads */
// TODO: Fold into permissions library
export function highProfilePrisonerOutsideCaseloadsGuard(): RequestHandler {
  return (_req, _res, next) => {
    if (!config.featureToggles.highProfilePrisonersEnabled) {
      return next()
    }

    if (!isHighProfilePrisonerOutsideCaseloads()) {
      return next()
    }

    return next(new NotFoundError('User is not allowed to access this page'))
  }
}

export default { highProfilePrisonerOutsideCaseloadsGuard }
