import { RequestHandler } from 'express'
import ServerError from '../utils/serverError'
import NotFoundError from '../utils/notFoundError'
import { prisonerBelongsToUsersCaseLoad, userHasRoles } from '../utils/utils'
import { Role } from '../data/enums/role'
import { addMiddlewareError } from './middlewareHelpers'
import { Prisoner } from '../interfaces/prisoner'
import { CaseLoad } from '../interfaces/caseLoad'

export default function checkPrisonerInCaseload({
  allowGlobal = true,
  allowInactive = true,
  activeCaseloadOnly = false,
} = {}): RequestHandler {
  return async (req, res, next) => {
    const prisonerData: Prisoner = req.middleware?.prisonerData
    const {
      activeCaseLoadId,
      caseLoads,
      userRoles,
    }: { activeCaseLoadId: string; caseLoads: CaseLoad[]; userRoles: string[] } = res.locals.user
    // This function requires prisoner data - so ensure that's present before continuing
    if (!prisonerData) {
      return next(new ServerError('CheckPrisonerInCaseloadMiddleware: No PrisonerData found in middleware'))
    }

    const errors: { message: string }[] = []
    const { restrictedPatient } = prisonerData
    const inactiveBooking = ['OUT', 'TRN'].some(prisonId => prisonId === prisonerData.prisonId)
    const globalSearchUser = userHasRoles([Role.GlobalSearch], userRoles)
    const inactiveBookingsUser = userHasRoles([Role.InactiveBookings], userRoles)
    const pomUser = userHasRoles([Role.PomUser], userRoles)

    // Restricted patients can only be accessed by POM users who have the supporting prison ID in their case loads
    function authenticateRestictedPatient() {
      if (prisonerData.restrictedPatient) {
        if (!pomUser || !prisonerBelongsToUsersCaseLoad(prisonerData.supportingPrisonId, caseLoads)) {
          errors.push({ message: 'CheckPrisonerInCaseloadMiddleware: Prisoner is restricted patient' })
        }
      }
    }

    // Prisoners with a caseload of OUT can only be accessed by people who have the inactive bookings role
    function authenticateOut() {
      if (!allowInactive || !inactiveBookingsUser) {
        errors.push({ message: `CheckPrisonerInCaseloadMiddleware: Prisoner is inactive [${prisonerData.prisonId}]` })
      }
    }

    // Prisoners with a caseload of TRN (transferring) can be accessed by people with global search or inactive bookings
    function authenticateTransfer() {
      const allowedToViewTransfers = globalSearchUser || inactiveBookingsUser

      if (!allowInactive || !allowedToViewTransfers) {
        errors.push({ message: `CheckPrisonerInCaseloadMiddleware: Prisoner is inactive [${prisonerData.prisonId}]` })
      }
    }

    /*
     * Prisoners can only be accessed if they are within your caseload
     * OR
     * You are a global search user and the route is able to be accessed globally
     */
    function authenticateActiveBooking() {
      if (!prisonerBelongsToUsersCaseLoad(prisonerData.prisonId, caseLoads)) {
        if (!allowGlobal || !globalSearchUser) {
          errors.push({ message: 'CheckPrisonerInCaseloadMiddleware: Prisoner not in caseloads' })
        }
      }
    }

    // Some routes can only be accessed if the prisoner is within your active caseload
    function ensureActiveCaseloadOnly() {
      if (activeCaseloadOnly && activeCaseLoadId !== prisonerData.prisonId) {
        errors.push({ message: 'CheckPrisonerInCaseloadMiddleware: Prisoner not in active caseload' })
      }
    }

    ensureActiveCaseloadOnly()

    if (restrictedPatient) {
      authenticateRestictedPatient()
    } else if (inactiveBooking) {
      if (prisonerData.prisonId === 'OUT') authenticateOut()
      if (prisonerData.prisonId === 'TRN') authenticateTransfer()
    } else {
      authenticateActiveBooking()
    }

    if (errors.length > 0) {
      return next(addMiddlewareError(req, next, new NotFoundError(errors.map(e => e.message).join(', '))))
    }

    return next()
  }
}
