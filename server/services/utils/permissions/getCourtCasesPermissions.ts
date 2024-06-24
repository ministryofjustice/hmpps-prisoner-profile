import { userHasRoles } from '../../../utils/utils'
import { Role } from '../../../data/enums/role'
import { HmppsUser } from '../../../interfaces/HmppsUser'
import PermissionItem from '../../interfaces/permissionsService/PermissionItem'

export default function getCourtCasesPermissions({ userRoles }: HmppsUser): PermissionItem {
  return {
    view: userHasRoles([Role.ReleaseDatesCalculator], userRoles),
    edit: userHasRoles([Role.AdjustmentsMaintainer], userRoles),
  }
}
