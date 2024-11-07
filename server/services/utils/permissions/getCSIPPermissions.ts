import { isInUsersCaseLoad } from '../../../utils/utils'
import { HmppsUser } from '../../../interfaces/HmppsUser'
import PermissionItem from '../../interfaces/permissionsService/PermissionItem'
import Prisoner from '../../../data/interfaces/prisonerSearchApi/Prisoner'

export default function getCSIPPermissions(user: HmppsUser, prisoner: Prisoner): PermissionItem {
  return {
    view: isInUsersCaseLoad(prisoner.prisonId, user) && !prisoner.restrictedPatient && prisoner.prisonId !== 'OUT',
  }
}
