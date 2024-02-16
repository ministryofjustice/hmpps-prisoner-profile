import { RequestHandler } from 'express'
import ServerError from '../utils/serverError'
import NotFoundError from '../utils/notFoundError'
import { prisonerBelongsToUsersCaseLoad, userHasRoles } from '../utils/utils'
import { Role } from '../data/enums/role'
import { addMiddlewareError } from './middlewareHelpers'
import { Prisoner } from '../interfaces/prisoner'
import { Services } from '../services'
import { CaseLoad } from '../interfaces/caseLoad'

export default function checkPrisonerInCaseload(
  services: Services,
  { allowGlobal = true, allowInactive = true, activeCaseloadOnly = false } = {},
): RequestHandler {
  return async (req, res, next) => {
    const prisonerData: Prisoner = req.middleware?.prisonerData
    const {
      activeCaseLoadId,
      caseLoads,
      userRoles,
    }: { activeCaseLoadId: string; caseLoads: CaseLoad[]; userRoles: string[] } = res.locals.user

    if (!prisonerData) {
      return next(new ServerError('CheckPrisonerInCaseloadMiddleware: No PrisonerData found in middleware'))
    }

    const globalSearchUser = userHasRoles([Role.GlobalSearch], userRoles)
    const canViewInactiveBookings = userHasRoles([Role.InactiveBookings], userRoles)
    const inactiveBooking = ['OUT', 'TRN'].some(prisonId => prisonId === prisonerData.prisonId)
    const pomUser = userRoles.filter(role => role.includes('POM')).length > 0

    if (prisonerData.restrictedPatient) {
      // Check for POM user here to avoid unnecessary calls to the restricted patient API
      if (pomUser) {
        const restrictedPatientApi = services.dataAccess.restrictedPatientApiClientBuilder(res.locals.clientToken)
        const restrictedPatient = await restrictedPatientApi.getRestrictedPatient(prisonerData.prisonerNumber)

        if (restrictedPatient && restrictedPatient.supportingPrison) {
          const { agencyId, active } = restrictedPatient.supportingPrison
          const canAccessRestrictedPatient = prisonerBelongsToUsersCaseLoad(agencyId, caseLoads) && active
          if (canAccessRestrictedPatient) return next()
        }
      }

      return next(
        addMiddlewareError(
          req,
          next,
          new NotFoundError(`CheckPrisonerInCaseloadMiddleware: Prisoner is restricted patient`),
        ),
      )
    }

    if (inactiveBooking) {
      const inactiveAllowed = allowInactive && canViewInactiveBookings
      const globalSearchAllowed = allowInactive && globalSearchUser

      // transferring prisoners can be viewed by global search users
      const canAccessInactiveProfile =
        prisonerData.prisonId === 'OUT' ? inactiveAllowed : inactiveAllowed || globalSearchAllowed

      if (canAccessInactiveProfile) return next()

      return next(
        addMiddlewareError(
          req,
          next,
          new NotFoundError(`CheckPrisonerInCaseloadMiddleware: Prisoner is inactive [${prisonerData.prisonId}]`),
        ),
      )
    }

    if (activeCaseloadOnly && activeCaseLoadId !== prisonerData.prisonId) {
      return next(
        addMiddlewareError(
          req,
          next,
          new NotFoundError('CheckPrisonerInCaseloadMiddleware: Prisoner not in active caseload'),
        ),
      )
    }

    if (
      !activeCaseloadOnly &&
      !prisonerBelongsToUsersCaseLoad(prisonerData.prisonId, caseLoads) &&
      !(allowGlobal && globalSearchUser)
    ) {
      return next(
        addMiddlewareError(
          req,
          next,
          new NotFoundError('CheckPrisonerInCaseloadMiddleware: Prisoner not in caseloads'),
        ),
      )
    }

    return next()
  }
}
