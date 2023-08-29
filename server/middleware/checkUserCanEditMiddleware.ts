import { RequestHandler } from 'express'
import { userCanEdit } from '../utils/utils'
import RoleError from '../utils/roleError'
import { addMiddlewareError } from './middlewareHelpers'
import ServerError from '../utils/serverError'

export default function checkUserCanEdit(): RequestHandler {
  return async (req, res, next) => {
    if (!req.middleware?.prisonerData) {
      return next(new ServerError('CheckUserCanEditMiddleware: No PrisonerData found in middleware'))
    }

    if (!userCanEdit(res.locals.user, req.middleware.prisonerData)) {
      return next(
        addMiddlewareError(req, next, new RoleError(`CheckUserCanEditMiddleware: not authorised for ${req.path}`)),
      )
    }

    return next()
  }
}
