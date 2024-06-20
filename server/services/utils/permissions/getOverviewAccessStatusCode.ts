import { isInUsersCaseLoad, userHasRoles } from '../../../utils/utils'
import { Role } from '../../../data/enums/role'
import { HmppsStatusCode } from '../../../data/enums/hmppsStatusCode'
import Prisoner from '../../../data/interfaces/prisonerSearchApi/Prisoner'
import { HmppsUser } from '../../../interfaces/HmppsUser'

export default function getOverviewAccessStatusCode(user: HmppsUser, prisoner: Prisoner): HmppsStatusCode {
  const { userRoles } = user
  const pomUser = userHasRoles([Role.PomUser], userRoles)
  const inactiveBookingsUser = userHasRoles([Role.InactiveBookings], userRoles)
  const globalSearchUser = userHasRoles([Role.GlobalSearch], userRoles)
  const prisonerIsOutOrTransferring = prisoner.prisonId === 'OUT' || prisoner.prisonId === 'TRN'

  const canViewRestrictedPatient =
    (pomUser && isInUsersCaseLoad(prisoner.supportingPrisonId, user)) || inactiveBookingsUser

  if (prisoner.restrictedPatient && !canViewRestrictedPatient) {
    return HmppsStatusCode.RESTRICTED_PATIENT
  }

  if (prisoner.prisonId === 'OUT' && !inactiveBookingsUser) {
    return HmppsStatusCode.PRISONER_IS_RELEASED
  }

  if (prisoner.prisonId === 'TRN' && !(globalSearchUser || inactiveBookingsUser)) {
    return HmppsStatusCode.PRISONER_IS_TRANSFERRING
  }

  if (!isInUsersCaseLoad(prisoner.prisonId, user) && !globalSearchUser && !pomUser && !prisonerIsOutOrTransferring) {
    return HmppsStatusCode.NOT_IN_CASELOAD
  }

  return HmppsStatusCode.OK
}
