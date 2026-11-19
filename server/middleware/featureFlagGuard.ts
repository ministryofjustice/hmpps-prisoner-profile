import type { RequestHandler } from 'express'
import NotFoundError from '../utils/notFoundError'
import { PrisonUser } from '../interfaces/HmppsUser'

export type FeatureFlagMethod = (activeCaseLoadId?: string) => boolean

export function featureFlagGuard(featureName: string, featureFlagMethod: FeatureFlagMethod): RequestHandler {
  return async (_req, res, next) => {
    const { activeCaseLoadId } = res.locals.user as PrisonUser
    if (featureFlagMethod(activeCaseLoadId)) {
      return next()
    }

    return next(new NotFoundError(`Feature ${featureName} is not enabled`))
  }
}
