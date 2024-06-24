import PermissionItem from '../../interfaces/permissionsService/PermissionItem'
import StaffRole from '../../../data/interfaces/prisonApi/StaffRole'

export default function getKeyWorkerPermissions(staffRoles: StaffRole[]): PermissionItem {
  return {
    edit: !!staffRoles?.find(({ role }) => role === 'KW'),
  }
}
