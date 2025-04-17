import { isActiveCaseLoad } from '../../../utils/utils'
import { HmppsUser } from '../../../interfaces/HmppsUser'
import PermissionItem from '../../interfaces/permissionsService/PermissionItem'
import Prisoner from '../../../data/interfaces/prisonerSearchApi/Prisoner'

export default function getAppointmentPermissions(user: HmppsUser, prisoner: Prisoner): PermissionItem {
  return {
    edit: isActiveCaseLoad(prisoner.prisonId, user) && !prisoner.restrictedPatient,
  }
}
