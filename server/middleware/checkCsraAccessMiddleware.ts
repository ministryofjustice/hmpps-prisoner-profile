import { RequestHandler } from 'express'
import { prisonerBelongsToUsersCaseLoad, prisonerIsTRN, userHasRoles } from '../utils/utils'
import { Role } from '../data/enums/role'
import RoleError from '../utils/roleError'
import { addMiddlewareError } from './middlewareHelpers'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import CaseLoad from '../data/interfaces/prisonApi/CaseLoad'
import ServerError from '../utils/serverError'

export default function checkCsraAccess(): RequestHandler {
  return async (req, res, next) => {
    const prisonerData: Prisoner = req.middleware?.prisonerData
    const { caseLoads, userRoles }: { caseLoads: CaseLoad[]; userRoles: string[] } = res.locals.user
    // This function requires prisoner data - so ensure that's present before continuing
    if (!prisonerData) {
      return next(new ServerError('CheckCsraAccessMiddleware: No PrisonerData found in middleware'))
    }
    const { prisonId } = prisonerData

    const canAccessCsra =
      prisonerBelongsToUsersCaseLoad(prisonId, caseLoads) ||
      (prisonerIsTRN(prisonId) && userHasRoles([Role.GlobalSearch], userRoles))

    if (!canAccessCsra) {
      return next(
        addMiddlewareError(req, next, new RoleError(`CheckCsraAccessMiddleware: not authorised for ${req.path}`)),
      )
    }

    return next()
  }
}
