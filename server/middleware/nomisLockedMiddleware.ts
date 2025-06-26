import logger from "../../logger"
import { NomisLockedError } from "../utils/nomisLockedErrorHelpers"

import { Request, Response, NextFunction } from 'express'

// Refreshes page if a locked error happens.
export function nomisLockedMiddleware(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof NomisLockedError) {
    req.flash('isLocked', 'true')
    req.flash('requestBody', JSON.stringify(req.body))
    const redirectTo = req.get('referer') || req.originalUrl || '/'
    logger.error("redirecting to: " + redirectTo)
    return res.redirect(redirectTo)
  }
  return next(err)
}

// Patches the render function to pass the locked flash flag to the view.
export function nomisLockedRenderMiddleware(req: Request, res: Response, next: NextFunction) {
  const isLocked = req.flash('isLocked')[0] === 'true'
  if (isLocked) {
    const originalRender = res.render.bind(res)
    res.render = (view: string, options: any = {}, callback?: (err: Error, html: string) => void) => {
      return originalRender(view, { ...options, isLocked }, callback)
    }
  }
  next()
}
