import type { NextFunction, Request, Response } from 'express'
import type { HTTPError } from 'superagent'
import { SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import logger from '../logger'
import NotFoundError from './utils/notFoundError'
import ServerError from './utils/serverError'
import RoleError from './utils/roleError'
import { HmppsStatusCode } from './data/enums/hmppsStatusCode'

/*
  The errors we get sometimes have the status in .status but also can the status on .responseStatus.
  As a result we need to handle both in the same way as an "any" type to prevent type errors where 
  there's no overlap.
*/
export default function createErrorHandler(production: boolean) {
  const getStatus = (error: any): number | undefined => {
    if (error.status) return error.status
    if (error.responseStatus) return error.responseStatus
    return undefined
  }

  const hasStatus = (error: any, status: number): boolean => {
    return (error.status && error.status === status) || (error.responseStatus && error.responseStatus === status)
  }

  return (
    error: HTTPError | NotFoundError | ServerError | RoleError | SanitisedError,
    req: Request,
    res: Response,
    next: NextFunction,
  ): void => {
    if (error instanceof NotFoundError && error.hmppsStatus !== HmppsStatusCode.NOT_FOUND) {
      logger.warn(`Error handling request for '${req.originalUrl}', user '${res.locals.user?.username}'`, error.message)
    } else {
      logger.error(`Error handling request for '${req.originalUrl}', user '${res.locals.user?.username}'`, error)
    }

    if (hasStatus(error, 401)) {
      logger.info('Logging user out')
      return res.redirect('/sign-out')
    }

    res.locals.hideBackLink = true

    if (hasStatus(error, 404) || hasStatus(error, 403)) {
      res.status(getStatus(error))
      return res.render('notFound', { url: req.headers.referer || '/' })
    }

    res.locals.message = production
      ? 'Something went wrong. The error has been logged. Please try again'
      : error.message
    res.locals.status = getStatus(error)
    res.locals.stack = production ? null : error.stack

    res.status(getStatus(error) || 500)

    return res.render('pages/error')
  }
}
