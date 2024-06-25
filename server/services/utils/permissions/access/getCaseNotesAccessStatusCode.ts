import { isInUsersCaseLoad, userHasAllRoles } from '../../../../utils/utils'
import { HmppsStatusCode } from '../../../../data/enums/hmppsStatusCode'
import getOverviewAccessStatusCode from './getOverviewAccessStatusCode'
import Prisoner from '../../../../data/interfaces/prisonerSearchApi/Prisoner'
import { HmppsUser } from '../../../../interfaces/HmppsUser'
import { Role } from '../../../../data/enums/role'

export default function getCaseNotesAccessStatusCode(user: HmppsUser, prisoner: Prisoner): HmppsStatusCode {
  const { restrictedPatient } = prisoner
  const prisonerIsOutOrTransferring = ['OUT', 'TRN'].some(prisonId => prisonId === prisoner.prisonId)
  const prisonerInCaseLoad = isInUsersCaseLoad(prisoner.prisonId, user)
  const hasGlobalAndPom = userHasAllRoles([Role.GlobalSearch, Role.PomUser], user.userRoles)

  if (!restrictedPatient && !prisonerIsOutOrTransferring && !prisonerInCaseLoad && !hasGlobalAndPom)
    return HmppsStatusCode.NOT_IN_CASELOAD

  return getOverviewAccessStatusCode(user, prisoner)
}
