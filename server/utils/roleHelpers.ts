import { Role } from '../data/enums/role'
import { userCanEdit, userHasAllRoles } from './utils'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import { HmppsUser } from '../interfaces/HmppsUser'

export const canViewCaseNotes = (user: HmppsUser, prisoner: Partial<Prisoner>) => {
  return userHasAllRoles([Role.GlobalSearch, Role.PomUser], user.userRoles) || userCanEdit(user, prisoner)
}

export const canAddCaseNotes = (user: HmppsUser, prisoner: Partial<Prisoner>) => {
  return userHasAllRoles([Role.GlobalSearch, Role.PomUser], user.userRoles) || userCanEdit(user, prisoner)
}
