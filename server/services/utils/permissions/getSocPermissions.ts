import { userHasRoles } from '../../../utils/utils'
import { Role } from '../../../data/enums/role'
import { HmppsUser } from '../../../interfaces/HmppsUser'
import PermissionItem from '../../interfaces/permissionsService/PermissionItem'

export default function getSocPermissions(user: HmppsUser): PermissionItem {
  return {
    view: userHasRoles([Role.SocCommunity, Role.SocCustody], user.userRoles),
    edit: userHasRoles([Role.SocCustody, Role.SocCommunity, Role.SocDataAnalyst, Role.SocDataManager], user.userRoles),
  }
}
