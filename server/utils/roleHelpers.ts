import { Role } from '../data/enums/role'
import { userCanEdit, userHasAllRoles, userHasRoles } from './utils'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import config from '../config'
import { User } from '../data/interfaces/manageUsersApi/User'

export const canViewCaseNotes = (user: User, prisoner: Partial<Prisoner>) => {
  return userHasAllRoles([Role.GlobalSearch, Role.PomUser], user.userRoles) || userCanEdit(user, prisoner)
}

export const canAddCaseNotes = (user: User, prisoner: Partial<Prisoner>) => {
  return userHasAllRoles([Role.GlobalSearch, Role.PomUser], user.userRoles) || userCanEdit(user, prisoner)
}

export const canViewCalculateReleaseDates = (user: User) => {
  return userHasRoles([Role.ReleaseDatesCalculator], user.userRoles) && !config.featureToggles.courCasesSummaryEnabled
}
