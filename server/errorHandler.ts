import type { NextFunction, Request, Response } from 'express'
import type { HTTPError } from 'superagent'
import logger from '../logger'
import NotFoundError from './utils/notFoundError'
import ServerError from './utils/serverError'
import RoleError from './utils/roleError'
import { HmppsStatusCode } from './data/enums/hmppsStatusCode'

export default function createErrorHandler(production: boolean) {
  return (
    error: HTTPError | NotFoundError | ServerError | RoleError,
    req: Request,
    res: Response,
    next: NextFunction,
  ): void => {
    if (error instanceof NotFoundError && error.hmppsStatus !== HmppsStatusCode.NOT_FOUND) {
      logger.warn(`Error handling request for '${req.originalUrl}', user '${res.locals.user?.username}'`, error.message)
    } else {
      logger.error(`Error handling request for '${req.originalUrl}', user '${res.locals.user?.username}'`, error)
    }

    if (error.status === 401) {
      logger.info('Logging user out')
      return res.redirect('/sign-out')
    }

    res.locals.hideBackLink = true

    if (error.status === 404 || error.status === 403) {
      res.status(error.status)
      return res.render('notFound', { url: req.headers.referer || '/' })
    }

    res.locals.message = production
      ? 'Something went wrong. The error has been logged. Please try again'
      : error.message
    res.locals.status = error.status
    res.locals.stack = production ? null : error.stack

    res.status(error.status || 500)

    return res.render('pages/error')
  }
}
