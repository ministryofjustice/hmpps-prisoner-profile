import { RequestHandler } from 'express'
import { isInUsersCaseLoad, prisonerIsTRN, userHasRoles } from '../utils/utils'
import { Role } from '../data/enums/role'
import RoleError from '../utils/roleError'
import { addMiddlewareError } from './middlewareHelpers'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import ServerError from '../utils/serverError'

export default function checkPrisonerIsInUsersCaseloads(): RequestHandler {
  return async (req, res, next) => {
    const prisonerData: Prisoner = req.middleware?.prisonerData
    const { userRoles }: { userRoles: string[] } = res.locals.user
    // This function requires prisoner data - so ensure that's present before continuing
    if (!prisonerData) {
      return next(new ServerError('CheckPrisonerIsInUsersCaseloadsMiddleware: No PrisonerData found in middleware'))
    }
    const { prisonId } = prisonerData

    const canAccessCsra =
      isInUsersCaseLoad(prisonId, res.locals.user) ||
      (prisonerIsTRN(prisonId) && userHasRoles([Role.GlobalSearch], userRoles))

    if (!canAccessCsra) {
      return next(
        addMiddlewareError(
          req,
          next,
          new RoleError(`CheckPrisonerIsInUsersCaseloadsMiddleware: not authorised for ${req.path}`),
        ),
      )
    }

    return next()
  }
}
