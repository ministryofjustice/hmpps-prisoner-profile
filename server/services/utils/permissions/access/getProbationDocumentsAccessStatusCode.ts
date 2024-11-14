import { HmppsStatusCode } from '../../../../data/enums/hmppsStatusCode'
import getOverviewAccessStatusCode from './getOverviewAccessStatusCode'
import Prisoner from '../../../../data/interfaces/prisonerSearchApi/Prisoner'
import { HmppsUser } from '../../../../interfaces/HmppsUser'
import { Role } from '../../../../data/enums/role'
import { userHasRoles } from '../../../../utils/utils'

export default function getProbationDocumentsAccessStatusCode(user: HmppsUser, prisoner: Prisoner): HmppsStatusCode {
  if (!userHasRoles([Role.PomUser, Role.ViewProbationDocuments], user.userRoles)) return HmppsStatusCode.NOT_FOUND

  return getOverviewAccessStatusCode(user, prisoner)
}
