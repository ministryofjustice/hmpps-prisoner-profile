import { Role } from '../data/enums/role'
import { userCanEdit, userHasAllRoles } from './utils'
import { Prisoner } from '../interfaces/prisoner'
import { User } from '../data/hmppsAuthClient'

export const canViewCaseNotes = (user: User, prisoner: Prisoner) => {
  return userHasAllRoles([Role.GlobalSearch, Role.PomUser], user.userRoles) || userCanEdit(user, prisoner)
}

export const canAddCaseNotes = (user: User, prisoner: Prisoner) => {
  return userCanEdit(user, prisoner)
}
