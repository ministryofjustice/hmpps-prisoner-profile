import type { RequestHandler } from 'express'
import logger from '../../logger'

export default function apiErrorMiddleware(): RequestHandler {
  return (_req, res, next) => {
    res.locals.apiErrorCallback = (error: Error) => {
      logger.error(error)
      res.locals.pageHasApiErrors = true
    }

    return next()
  }
}
