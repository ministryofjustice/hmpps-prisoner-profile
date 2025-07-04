import { NextFunction, Request, Response } from 'express'
import { HmppsStatusCode } from '../data/enums/hmppsStatusCode'
import NotFoundError from '../utils/notFoundError'
import { PrisonUser } from '../interfaces/HmppsUser'

export type FeatureFlagMethod = (activeCaseLoadId?: string) => boolean

export function featureFlagGuard(featureName: string, featureFlagMethod: FeatureFlagMethod) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { activeCaseLoadId } = res.locals.user as PrisonUser
    if (featureFlagMethod(activeCaseLoadId)) {
      return next()
    }

    return next(new NotFoundError(`Feature ${featureName} is not enabled`, HmppsStatusCode.NOT_FOUND))
  }
}
