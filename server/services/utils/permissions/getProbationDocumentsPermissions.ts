import { isInUsersCaseLoad, userHasRoles } from '../../../utils/utils'
import { Role } from '../../../data/enums/role'
import { HmppsUser } from '../../../interfaces/HmppsUser'
import PermissionItem from '../../interfaces/permissionsService/PermissionItem'
import Prisoner from '../../../data/interfaces/prisonerSearchApi/Prisoner'

export default function getProbationDocumentsPermissions(user: HmppsUser, prisoner: Prisoner): PermissionItem {
  return {
    view:
      userHasRoles([Role.PomUser, Role.ViewProbationDocuments], user.userRoles) &&
      (isInUsersCaseLoad(prisoner.prisonId, user) || ['OUT', 'TRN'].includes(prisoner.prisonId)),
  }
}
