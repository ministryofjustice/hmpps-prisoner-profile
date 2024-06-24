import { isActiveCaseLoad, userHasRoles } from '../../../utils/utils'
import { Role } from '../../../data/enums/role'
import { HmppsUser } from '../../../interfaces/HmppsUser'
import PermissionItem from '../../interfaces/permissionsService/PermissionItem'
import Prisoner from '../../../data/interfaces/prisonerSearchApi/Prisoner'

export default function getActivityPermissions(user: HmppsUser, prisoner: Prisoner): PermissionItem {
  return {
    edit:
      userHasRoles([Role.ActivityHub], user.userRoles) &&
      isActiveCaseLoad(prisoner.prisonId, user) &&
      prisoner.status !== 'ACTIVE OUT',
  }
}
