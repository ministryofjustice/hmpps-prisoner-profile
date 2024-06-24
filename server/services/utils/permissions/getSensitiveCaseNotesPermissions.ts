import { userHasRoles } from '../../../utils/utils'
import { Role } from '../../../data/enums/role'
import { HmppsUser } from '../../../interfaces/HmppsUser'
import PermissionItem from '../../interfaces/permissionsService/PermissionItem'

export default function getSensitiveCaseNotesPermissions(user: HmppsUser): PermissionItem {
  return {
    view: userHasRoles([Role.PomUser, Role.ViewSensitiveCaseNotes, Role.AddSensitiveCaseNotes], user.userRoles),
    delete: userHasRoles([Role.DeleteSensitiveCaseNotes], user.userRoles),
    edit: userHasRoles([Role.PomUser, Role.AddSensitiveCaseNotes], user.userRoles),
  }
}
