import { isInUsersCaseLoad, userHasAllRoles } from '../../../../utils/utils'
import { HmppsStatusCode } from '../../../../data/enums/hmppsStatusCode'
import Prisoner from '../../../../data/interfaces/prisonerSearchApi/Prisoner'
import { HmppsUser } from '../../../../interfaces/HmppsUser'
import { Role } from '../../../../data/enums/role'

export default function getCaseNotesAccessStatusCode(user: HmppsUser, prisoner: Prisoner): HmppsStatusCode {
  const { restrictedPatient } = prisoner
  const prisonerInCaseLoad = isInUsersCaseLoad(prisoner.prisonId, user)
  const hasInactiveBookingsRole = userHasAllRoles([Role.InactiveBookings], user.userRoles)
  const hasPomRoleInSupportingPrison =
    userHasAllRoles([Role.PomUser], user.userRoles) && isInUsersCaseLoad(prisoner.supportingPrisonId, user)

  // Restricted Patient case notes can oly be view by users holding the POM role in the supporting prison or by users
  // with the inactive bookings role.
  if (restrictedPatient) {
    return hasPomRoleInSupportingPrison || hasInactiveBookingsRole
      ? HmppsStatusCode.OK
      : HmppsStatusCode.RESTRICTED_PATIENT
  }

  // Released prisoner case notes can only be view by users with the inactive bookings role.
  if (prisoner.prisonId === 'OUT') {
    return hasInactiveBookingsRole ? HmppsStatusCode.OK : HmppsStatusCode.PRISONER_IS_RELEASED
  }

  // Transferring prisoner case notes can only be view by users with the inactive bookings role.
  if (prisoner.prisonId === 'TRN') {
    return hasInactiveBookingsRole ? HmppsStatusCode.OK : HmppsStatusCode.PRISONER_IS_TRANSFERRING
  }

  // Active prisoner case notes can only by users assigned to the prisoners caseload.
  return prisonerInCaseLoad ? HmppsStatusCode.OK : HmppsStatusCode.NOT_IN_CASELOAD
}
