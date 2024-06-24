import { userHasRoles } from '../../../utils/utils'
import { Role } from '../../../data/enums/role'
import { HmppsUser } from '../../../interfaces/HmppsUser'
import PermissionItem from '../../interfaces/permissionsService/PermissionItem'

export default function getOffenderCategorisationPermissions(user: HmppsUser): PermissionItem {
  return {
    edit: userHasRoles(
      [Role.CreateCategorisation, Role.ApproveCategorisation, Role.CreateRecategorisation, Role.CategorisationSecurity],
      user.userRoles,
    ),
  }
}
