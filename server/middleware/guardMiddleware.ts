import { RequestHandler } from 'express'
import NotFoundError from '../utils/notFoundError'
import logger from '../../logger'
import { addMiddlewareError } from './middlewareHelpers'

// eslint-disable-next-line no-shadow
export enum GuardOperator {
  AND,
  OR,
}

export default function guardMiddleware(operator: GuardOperator, ...handlers: RequestHandler[]): RequestHandler {
  return async (req, res, next) => {
    if (!handlers?.length) {
      logger.warn(`GuardMiddleware called with no handlers for ${req.path}`)
      return next()
    }

    req.middleware = {
      ...req.middleware,
      usingGuard: req.middleware?.usingGuard ? req.middleware.usingGuard + 1 : 1,
    }

    const guardNumber = req.middleware.usingGuard

    logger.debug(
      `GuardMiddleware: Guard #${guardNumber} processing ${handlers.length} request handlers with ${GuardOperator[operator]} operator for ${req.path}`,
    )

    await Promise.all(
      handlers.map(handler =>
        handler(req, res, () => {
          return null
        }),
      ),
    )

    req.middleware.usingGuard -= 1

    const success =
      operator === GuardOperator.AND
        ? !req.middleware.errors || !req.middleware.errors[guardNumber]?.length
        : !req.middleware.errors || req.middleware.errors[guardNumber]?.length !== handlers.length

    if (success) {
      logger.debug(`GuardMiddleware: Guard #${guardNumber} Pass`)
      return next()
    }

    // Nested guard error handling
    if (guardNumber > 1) {
      return next(addMiddlewareError(req, next, new NotFoundError(`GuardMiddleware: Guard #${guardNumber} Fail`)))
    }

    return next(new NotFoundError(`GuardMiddleware: Guard #${guardNumber} Fail`))
  }
}
