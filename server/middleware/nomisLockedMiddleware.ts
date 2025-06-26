import { Request, Response, NextFunction } from 'express'
import { NomisLockedError } from '../utils/nomisLockedErrorHelpers'

// If there is a nomis locked error from one of the api clients, flash a locked flag and send them back.
export function nomisLockedMiddleware(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof NomisLockedError) {
    req.flash('isLocked', 'true')
    req.flash('requestBody', JSON.stringify(req.body))
    return res.redirect(req.get('referer') || req.originalUrl || '/')
  }
  return next(err)
}

// If a locked flag is set to true, patch res.render to include the flag in view scope.
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
