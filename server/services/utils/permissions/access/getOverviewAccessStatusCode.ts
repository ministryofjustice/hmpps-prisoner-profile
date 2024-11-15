import { isInUsersCaseLoad, userHasRoles } from '../../../../utils/utils'
import { Role } from '../../../../data/enums/role'
import { HmppsStatusCode } from '../../../../data/enums/hmppsStatusCode'
import Prisoner from '../../../../data/interfaces/prisonerSearchApi/Prisoner'
import { HmppsUser } from '../../../../interfaces/HmppsUser'

/*
 * The "default" access checks for accessing information about a prisoner.
 *
 * This function can be used for checking what we consider the "base checks" for accessing a page on the prisoner profile
 * when no other special cases are given.
 *
 * It provides the following options for special circumstances:
 *
 * - allowGlobal (default: true): Does the page allow access to users outside the prisoners current case load
 */
export default function getOverviewAccessStatusCode(
  user: HmppsUser,
  prisoner: Prisoner,
  options: { allowGlobal: boolean } = { allowGlobal: true },
): HmppsStatusCode {
  const { userRoles } = user
  const pomUser = userHasRoles([Role.PomUser], userRoles)
  const inactiveBookingsUser = userHasRoles([Role.InactiveBookings], userRoles)
  const globalSearchUser = userHasRoles([Role.GlobalSearch], userRoles)
  const inUsersCaseLoad = isInUsersCaseLoad(prisoner.prisonId, user)

  /*
   * Restricted patients have a caseload of 'OUT', but they are able to be accessed in additional circumstances
   * so we process this first, as the POM user acts as an override when given the correct caseloads.
   *
   * Restricted patients can be accessed in the following circumstances:
   * - The user has the "Inactive Bookings" role
   * - The user is a POM user & has the supporting prison ID in their caseloads
   */
  const getRestrictedPatientAccessCode = () => {
    const userHasPrisonersSupportingPrisonInTheirCaseLoad = isInUsersCaseLoad(prisoner.supportingPrisonId, user)
    const userIsPomUserWithSupportingPrisonInTheirCaseLoad = pomUser && userHasPrisonersSupportingPrisonInTheirCaseLoad

    if (userIsPomUserWithSupportingPrisonInTheirCaseLoad) {
      return HmppsStatusCode.OK
    }

    if (inactiveBookingsUser) {
      return HmppsStatusCode.OK
    }

    return HmppsStatusCode.RESTRICTED_PATIENT
  }

  /*
   * A prisoner is considered a "released prisoner" when they have the caseload of "OUT"
   *
   * Released prisoners can be accessed in the following circumstances:
   * - The user has the "Inactive Bookings" role
   */
  const getReleasedPrisonerAccessCode = () => {
    if (inactiveBookingsUser) {
      return HmppsStatusCode.OK
    }

    return HmppsStatusCode.PRISONER_IS_RELEASED
  }

  /*
   * A prisoner is considered a "transferring prisoner" when they have the caseload of "TRN"
   *
   * Released prisoners can be accessed in the following circumstances:
   * - The user has the "Global search" role
   * - The user has the "Inactive Bookings" role
   */
  const getTransferringPrisonerAccessCode = () => {
    if (globalSearchUser) {
      return HmppsStatusCode.OK
    }

    if (inactiveBookingsUser) {
      return HmppsStatusCode.OK
    }

    return HmppsStatusCode.PRISONER_IS_TRANSFERRING
  }

  /*
   * Getting "global access" to prisoners requires the "Global search" role, and is used when accessing
   * a prisoner which is outside one of your assigned case loads.
   * E.g. Accessing prisoner data for a prisoner in Leeds when you only have the Bristol case load.
   *
   * Some pages are disabled in the global view via the options parameter "allowGlobal: false"
   *
   * Global access can be granted in the following circumstances:
   * - The user has the "Global search" role
   */
  const getGlobalAccessCode = () => {
    if (!options.allowGlobal) {
      return HmppsStatusCode.GLOBAL_USER_NOT_PERMITTED
    }

    if (globalSearchUser) {
      return HmppsStatusCode.OK
    }

    return HmppsStatusCode.NOT_IN_CASELOAD
  }

  /*
   * The default check for a prisoner who is currently assigned to a case load.
   *
   * Access can be granted in the following circumstances:
   * - The user has the prisoners case load in any assigned case loads (it does not require it to be the active case load)
   */
  const getPrisonerAccessCode = () => {
    if (inUsersCaseLoad) {
      return HmppsStatusCode.OK
    }
    return HmppsStatusCode.NOT_IN_CASELOAD
  }

  /*
   * Access checks begin here
   */

  if (prisoner.restrictedPatient) {
    return getRestrictedPatientAccessCode()
  }

  if (prisoner.prisonId === 'OUT') {
    return getReleasedPrisonerAccessCode()
  }

  if (prisoner.prisonId === 'TRN') {
    return getTransferringPrisonerAccessCode()
  }

  if (!inUsersCaseLoad) {
    return getGlobalAccessCode()
  }

  return getPrisonerAccessCode()
}
