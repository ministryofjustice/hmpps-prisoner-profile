import { userCanEdit } from '../../../utils/utils'
import { HmppsUser } from '../../../interfaces/HmppsUser'
import PermissionItem from '../../interfaces/permissionsService/PermissionItem'
import Prisoner from '../../../data/interfaces/prisonerSearchApi/Prisoner'

export default function getUseOfForcePermissions(user: HmppsUser, prisoner: Prisoner): PermissionItem {
  return {
    edit: userCanEdit(user, prisoner) && !prisoner.restrictedPatient,
  }
}
