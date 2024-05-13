import { Role } from '../data/enums/role'
import { User } from '../data/hmppsAuthClient'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import { prisonerBelongsToUsersCaseLoad, userCanEdit, userHasRoles } from './utils'

export default (user: User, prisoner: Prisoner) => {
  return {
    // General access rules
    // I'm not sure if they'd be useful here, they seem too generic and we may want to instead be more granular field level as below?
    // But these could be useful as variables to prevent multiple function calls below
    globalSearch: true,
    transferringPrisoner: true,
    releasedPrisoner: true,

    // Below are (i believe) all the actions we currently have that are user performed, with a few examples of moving
    // the permissions check for them into this object
    addToSoc: { viewLink: true },
    adjudications: {
      view: true,
    },
    alerts: {
      view: true,
      // Using the user has roles function as required
      edit: userHasRoles([Role.UpdateAlert], user.userRoles) && userCanEdit(user, prisoner),
    },
    calculateReleaseDates: { view: true },
    caseNotes: {
      view: true,
      edit: true,
      sensitive: {
        delete: userHasRoles([Role.DeleteSensitiveCaseNotes], user.userRoles),
        view: userHasRoles([Role.PomUser, Role.ViewSensitiveCaseNotes, Role.AddSensitiveCaseNotes], user.userRoles),
        edit: userHasRoles([Role.PomUser, Role.AddSensitiveCaseNotes], user.userRoles),
      },
    },
    cellMoves: { access: true },
    courtSummary: { view: true },
    csra: { view: true },
    category: { manage: true },
    educationWorkPlan: { edit: true },
    incentives: { view: true },
    logActivity: { viewLink: true },
    money: { view: true },
    pathfinder: { viewLink: true },
    visits: { view: true },

    // We could look to arrange fields based on pages, or by "data model area" if we have an idea of that
    personal: {
      // This field is viewed dependent on the user having access to the actual caseload (aka global view/not global view)
      // rather than being strictly role based, this could go in a separate class but i think it makes sense here also
      appearance: { view: prisonerBelongsToUsersCaseLoad(prisoner.prisonId, user.caseLoads), edit: true },
    },
  }
}
