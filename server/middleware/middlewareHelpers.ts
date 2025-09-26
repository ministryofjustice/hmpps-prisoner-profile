import { NextFunction, Request } from 'express'
import logger from '../../logger'

export function addMiddlewareError(req: Request, next: NextFunction, error: Error) {
  const usingGuard = req.middleware?.usingGuard

  if (!usingGuard) {
    return error
  }

  logger.debug(error.message)

  const errors = req.middleware?.errors
  req.middleware = {
    ...req.middleware,
    errors: {
      [usingGuard]: errors && errors[usingGuard] ? [...errors[usingGuard], error] : [error],
    },
  }
  return 'route'
}

export default { addMiddlewareError }
