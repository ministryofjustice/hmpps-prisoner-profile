import { RequestHandler } from 'express'
import { userHasRoles } from '../utils/utils'
import { Role } from '../data/enums/role'
import RoleError from '../utils/roleError'
import { addMiddlewareError } from './middlewareHelpers'

export default function checkHasSomeRoles(roles: Role[]): RequestHandler {
  return async (req, res, next) => {
    if (!userHasRoles(roles, res.locals.user.userRoles)) {
      return next(
        addMiddlewareError(req, next, new RoleError(`CheckHasSomeRolesMiddleware: not authorised for ${req.path}`)),
      )
    }

    return next()
  }
}
