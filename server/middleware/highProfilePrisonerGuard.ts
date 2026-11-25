import type { RequestHandler } from 'express'
import config from '../config'
import NotFoundError from '../utils/notFoundError'

/** Returns 404 when accessing a high-profile prisoner */
// TODO: Fold into permissions library
// eslint-disable-next-line import/prefer-default-export
export function highProfilePrisonerGuard(forbid: 'outside-caseloads' | 'any'): RequestHandler {
  return (_req, res, next) => {
    if (!config.featureToggles.highProfilePrisonersEnabled) {
      next()
      return
    }

    if (
      (forbid === 'outside-caseloads' && res.locals.isHighProfilePrisonerOutsideCaseloads) ||
      (forbid === 'any' && res.locals.isHighProfilePrisoner)
    ) {
      next(new NotFoundError('User is not allowed to access this page'))
      return
    }

    next()
  }
}
