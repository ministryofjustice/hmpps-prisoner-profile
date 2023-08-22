import { RequestHandler } from 'express'
import ServerError from '../utils/serverError'
import NotFoundError from '../utils/notFoundError'
import { prisonerBelongsToUsersCaseLoad, userHasRoles } from '../utils/utils'
import { Role } from '../data/enums/role'
import { addMiddlewareError } from './middlewareHelpers'

export default function checkPrisonerInCaseload({ allowGlobal = true, allowInactive = true } = {}): RequestHandler {
  return async (req, res, next) => {
    const prisonerData = req.middleware?.prisonerData

    if (!prisonerData) {
      return next(new ServerError('CheckPrisonerInCaseloadMiddleware: No PrisonerData found in middleware'))
    }

    const globalSearchUser = userHasRoles([Role.GlobalSearch], res.locals.user.userRoles)
    const canViewInactiveBookings = userHasRoles([Role.InactiveBookings], res.locals.user.userRoles)
    const inactiveBooking = ['OUT', 'TRN'].some(prisonId => prisonId === prisonerData.prisonId)

    if (inactiveBooking) {
      if (!(allowInactive && canViewInactiveBookings) && !(allowGlobal && globalSearchUser)) {
        addMiddlewareError(
          req,
          next,
          new NotFoundError(`CheckPrisonerInCaseloadMiddleware: Prisoner is inactive [${prisonerData.prisonId}]`),
        )
      }
      return next()
    }

    if (
      !prisonerBelongsToUsersCaseLoad(prisonerData.prisonId, res.locals.user.caseLoads) &&
      !(allowGlobal && globalSearchUser)
    ) {
      addMiddlewareError(req, next, new NotFoundError('CheckPrisonerInCaseloadMiddleware: Prisoner not in caseload'))
    }

    return next()
  }
}
