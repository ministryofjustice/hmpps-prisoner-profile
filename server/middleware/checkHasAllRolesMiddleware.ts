import { RequestHandler } from 'express'
import { userHasAllRoles } from '../utils/utils'
import { Role } from '../data/enums/role'
import RoleError from '../utils/roleError'
import { addMiddlewareError } from './middlewareHelpers'

export default function checkHasAllRoles(roles: Role[]): RequestHandler {
  return async (req, res, next) => {
    if (!userHasAllRoles(roles, res.locals.user.userRoles)) {
      return next(
        addMiddlewareError(req, next, new RoleError(`CheckHasAllRolesMiddleware: not authorised for ${req.path}`)),
      )
    }

    return next()
  }
}
