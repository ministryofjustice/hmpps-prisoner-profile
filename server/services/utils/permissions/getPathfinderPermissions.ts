import { userHasRoles } from '../../../utils/utils'
import { Role } from '../../../data/enums/role'
import { HmppsUser } from '../../../interfaces/HmppsUser'
import PermissionItem from '../../interfaces/permissionsService/PermissionItem'

export default function getPathfinderPermissions(user: HmppsUser): PermissionItem {
  return {
    view: userHasRoles(
      [
        Role.PathfinderApproval,
        Role.PathfinderStdPrison,
        Role.PathfinderStdProbation,
        Role.PathfinderHQ,
        Role.PathfinderUser,
        Role.PathfinderLocalReader,
        Role.PathfinderNationalReader,
        Role.PathfinderPolice,
        Role.PathfinderPsychologist,
      ],
      user.userRoles,
    ),
    edit: userHasRoles(
      [
        Role.PathfinderApproval,
        Role.PathfinderStdPrison,
        Role.PathfinderStdProbation,
        Role.PathfinderHQ,
        Role.PathfinderUser,
      ],
      user.userRoles,
    ),
  }
}
