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

    const { restrictedPatient } = prisonerData
    const inactiveBooking = ['OUT', 'TRN'].some(prisonId => prisonId === prisonerData.prisonId)
    const globalSearchUser = userHasRoles([Role.GlobalSearch], userRoles)
    const inactiveBookingsUser = userHasRoles([Role.InactiveBookings], userRoles)
    const pomUser = userHasRoles([Role.PomUser], userRoles)

    /*
     * Restricted patients can be accessed by:
     * - POM users who have the supporting prison ID in their case loads
     * - Users with the inactive bookings role
     */
    function authenticateRestictedPatient() {
      return (
        (pomUser && prisonerBelongsToUsersCaseLoad(prisonerData.supportingPrisonId, caseLoads)) || inactiveBookingsUser
      )
    }

    // Prisoners with a caseload of OUT can only be accessed by people who have the inactive bookings role
    function authenticateOut() {
      return allowInactive && inactiveBookingsUser
    }

    // Prisoners with a caseload of TRN (transferring) can be accessed by people with global search or inactive bookings
    function authenticateTransfer() {
      const allowedToViewTransfers = globalSearchUser || inactiveBookingsUser
      return allowInactive && allowedToViewTransfers
    }

    /*
     * Prisoners can only be accessed if they are within your caseload
     * OR
     * You are a global search user and the route is able to be accessed globally
     */
    function authenticateActiveBooking() {
      if (prisonerBelongsToUsersCaseLoad(prisonerData.prisonId, caseLoads)) {
        return true
      }

      return allowGlobal && globalSearchUser
    }

    // Some routes can only be accessed if the prisoner is within your active caseload
    function authenticateActiveCaseloadOnly() {
      return activeCaseLoadId === prisonerData.prisonId
    }

    function authenticationError(message: string) {
      return next(addMiddlewareError(req, next, new NotFoundError(message)))
    }

    if (activeCaseloadOnly && !authenticateActiveCaseloadOnly()) {
      return authenticationError('CheckPrisonerInCaseloadMiddleware: Prisoner not in active caseload')
    }

    if (restrictedPatient) {
      if (!authenticateRestictedPatient()) {
        return authenticationError('CheckPrisonerInCaseloadMiddleware: Prisoner is restricted patient')
      }
    } else if (inactiveBooking) {
      if (prisonerData.prisonId === 'OUT' && !authenticateOut()) {
        return authenticationError(`CheckPrisonerInCaseloadMiddleware: Prisoner is inactive [${prisonerData.prisonId}]`)
      }
      if (prisonerData.prisonId === 'TRN' && !authenticateTransfer()) {
        return authenticationError(`CheckPrisonerInCaseloadMiddleware: Prisoner is inactive [${prisonerData.prisonId}]`)
      }
    } else if (!authenticateActiveBooking()) {
      return authenticationError('CheckPrisonerInCaseloadMiddleware: Prisoner not in caseloads')
    }

    return next()
  }
}
