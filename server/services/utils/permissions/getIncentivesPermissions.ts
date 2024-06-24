import { isInUsersCaseLoad, userHasRoles } from '../../../utils/utils'
import { HmppsUser } from '../../../interfaces/HmppsUser'
import PermissionItem from '../../interfaces/permissionsService/PermissionItem'
import Prisoner from '../../../data/interfaces/prisonerSearchApi/Prisoner'
import { Role } from '../../../data/enums/role'

export default function getIncentivesPermissions(user: HmppsUser, prisoner: Prisoner): PermissionItem {
  return {
    view: isInUsersCaseLoad(prisoner.prisonId, user) || userHasRoles([Role.GlobalSearch], user.userRoles),
  }
}
