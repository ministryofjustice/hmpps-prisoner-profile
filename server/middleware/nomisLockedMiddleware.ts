import { Request, Response, NextFunction } from 'express'
import { NomisLockedError } from '../utils/nomisLockedError'
import MetricsService from '../services/metrics/metricsService'
import { PrisonUser } from '../interfaces/HmppsUser'

export function nomisLockedMiddleware(metricsService: MetricsService) {
  return (err: unknown, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof NomisLockedError) {
      const { prisonerNumber } = req.middleware.prisonerData
      metricsService.trackNomisLockedWarning(
        prisonerNumber,
        req.originalUrl,
        err.endpoint,
        res.locals.user as PrisonUser,
      )
      req.flash('isLocked', 'true')
      req.flash('requestBody', JSON.stringify(req.body))
      return res.redirect(req.originalUrl)
    }
    return next(err)
  }
}

export function nomisLockedRenderMiddleware(req: Request, res: Response, next: NextFunction) {
  const isLocked = req.flash('isLocked')[0] === 'true'
  if (isLocked) {
    const originalRender = res.render.bind(res)
    res.render = (view: string, options?: object, callback?: (err: Error, html: string) => void) => {
      return originalRender(view, { ...options, isLocked }, callback)
    }
  }
  next()
}
