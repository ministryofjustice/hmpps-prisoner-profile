import { isInUsersCaseLoad, userHasRoles } from '../../../../utils/utils'
import { Role } from '../../../../data/enums/role'
import { HmppsStatusCode } from '../../../../data/enums/hmppsStatusCode'
import Prisoner from '../../../../data/interfaces/prisonerSearchApi/Prisoner'
import { HmppsUser } from '../../../../interfaces/HmppsUser'

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

  if (prisoner.restrictedPatient) {
    return (pomUser && isInUsersCaseLoad(prisoner.supportingPrisonId, user)) || inactiveBookingsUser
      ? HmppsStatusCode.OK
      : HmppsStatusCode.RESTRICTED_PATIENT
  }

  if (prisoner.prisonId === 'OUT') {
    return inactiveBookingsUser ? HmppsStatusCode.OK : HmppsStatusCode.PRISONER_IS_RELEASED
  }

  if (prisoner.prisonId === 'TRN') {
    return globalSearchUser || inactiveBookingsUser ? HmppsStatusCode.OK : HmppsStatusCode.PRISONER_IS_TRANSFERRING
  }

  if (globalSearchUser && !options.allowGlobal) {
    return HmppsStatusCode.GLOBAL_USER_NOT_PERMITTED
  }

  return inUsersCaseLoad || globalSearchUser || pomUser ? HmppsStatusCode.OK : HmppsStatusCode.NOT_IN_CASELOAD
}
