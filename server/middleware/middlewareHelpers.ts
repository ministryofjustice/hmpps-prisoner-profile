import { NextFunction, Request } from 'express'
import logger from '../../logger'

// eslint-disable-next-line import/prefer-default-export
export function addMiddlewareError(req: Request, next: NextFunction, error: Error) {
  const usingGuard = req.middleware?.usingGuard

  if (!usingGuard) {
    return next(error)
  }

  logger.debug(error.message)

  const errors = req.middleware?.errors
  req.middleware = {
    ...req.middleware,
    errors: {
      [usingGuard]: errors && errors[usingGuard] ? [...errors[usingGuard], error] : [error],
    },
  }
  return null
}
