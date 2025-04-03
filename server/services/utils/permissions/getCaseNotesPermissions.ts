import { HmppsUser } from '../../../interfaces/HmppsUser'
import PermissionItem from '../../interfaces/permissionsService/PermissionItem'
import Prisoner from '../../../data/interfaces/prisonerSearchApi/Prisoner'
import { HmppsStatusCode } from '../../../data/enums/hmppsStatusCode'
import getCaseNotesAccessStatusCode from './access/getCaseNotesAccessStatusCode'

export default function getCaseNotesPermissions(user: HmppsUser, prisoner: Prisoner): PermissionItem {
  return {
    edit: canUserAccessCaseNoteForPrisoner(user, prisoner),
    view: canViewCaseNotes(user, prisoner),
  }
}

export const canViewCaseNotes = (user: HmppsUser, prisoner: Partial<Prisoner>) => {
  return canUserAccessCaseNoteForPrisoner(user, prisoner)
}

export const canAddCaseNotes = (user: HmppsUser, prisoner: Partial<Prisoner>) => {
  return canUserAccessCaseNoteForPrisoner(user, prisoner)
}

function canUserAccessCaseNoteForPrisoner(user: HmppsUser, prisoner: Partial<Prisoner>): boolean {
  return getCaseNotesAccessStatusCode(user, prisoner) === HmppsStatusCode.OK
}
