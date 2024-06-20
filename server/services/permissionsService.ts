import { HmppsStatusCode } from '../data/enums/hmppsStatusCode'
import { isActiveCaseLoad, isInUsersCaseLoad, userCanEdit, userHasAllRoles, userHasRoles } from '../utils/utils'
import { Role } from '../data/enums/role'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import { HmppsUser } from '../interfaces/HmppsUser'
import UserService from './userService'
import getOverviewAccessStatusCode from './utils/permissions/getOverviewAccessStatusCode'

interface PermissionItem {
  view: boolean
  edit?: boolean
}

export interface Permissions {
  accessCode: HmppsStatusCode
  courtCases?: PermissionItem
  money?: PermissionItem
  adjudications?: PermissionItem
  visits?: PermissionItem
  incentives?: PermissionItem
  category?: PermissionItem
  calculateReleaseDates?: PermissionItem
  caseNotes?: PermissionItem
  keyWorker?: PermissionItem
  appointment?: PermissionItem
  useOfForce?: PermissionItem
  activity?: PermissionItem
  pathfinder?: PermissionItem
  soc?: PermissionItem
  offenderCategorisation?: PermissionItem
  probationDocuments?: PermissionItem
}

export default class PermissionsService {
  constructor(private readonly userService: UserService) {}

  public async getOverviewPermissions(user: HmppsUser, prisoner: Prisoner, clientToken?: string): Promise<Permissions> {
    const { userRoles } = user

    const accessCode = getOverviewAccessStatusCode(user, prisoner)
    if (accessCode !== HmppsStatusCode.OK) return { accessCode }

    const isPrisonerInCaseLoad = isInUsersCaseLoad(prisoner.prisonId, user)

    const staffRoles = await this.userService.getStaffRoles(clientToken, user)

    return {
      accessCode,
      courtCases: {
        view: userHasRoles([Role.ReleaseDatesCalculator], userRoles),
        edit: userHasRoles([Role.AdjustmentsMaintainer], userRoles),
      },
      money: {
        view: isPrisonerInCaseLoad,
      },
      adjudications: {
        view: isPrisonerInCaseLoad || userHasRoles([Role.PomUser, Role.ReceptionUser], userRoles),
      },
      visits: {
        view: isPrisonerInCaseLoad || userHasRoles([Role.PomUser, Role.ReceptionUser], userRoles),
      },
      incentives: {
        view: isPrisonerInCaseLoad || userHasRoles([Role.GlobalSearch], userRoles),
      },
      category: {
        view: false,
        edit: userHasRoles(
          [
            Role.CreateRecategorisation,
            Role.ApproveCategorisation,
            Role.CreateRecategorisation,
            Role.CategorisationSecurity,
          ],
          userRoles,
        ),
      },
      calculateReleaseDates: {
        view: false,
        edit: userHasRoles([Role.ReleaseDatesCalculator], user.userRoles),
      },
      caseNotes: {
        view: false,
        edit: userHasAllRoles([Role.GlobalSearch, Role.PomUser], user.userRoles) || userCanEdit(user, prisoner),
      },
      keyWorker: {
        view: false,
        edit: !!staffRoles?.find(({ role }) => role === 'KW'),
      },
      appointment: {
        view: false,
        edit: isActiveCaseLoad(prisoner.prisonId, user) && !prisoner.restrictedPatient,
      },
      useOfForce: {
        view: false,
        edit: userCanEdit(user, prisoner) && !prisoner.restrictedPatient,
      },
      activity: {
        view: false,
        edit:
          userHasRoles([Role.ActivityHub], user.userRoles) &&
          isActiveCaseLoad(prisoner.prisonId, user) &&
          prisoner.status !== 'ACTIVE OUT',
      },
      pathfinder: {
        view: userHasRoles(
          [
            Role.PathfinderApproval,
            Role.PathfinderStdPrison,
            Role.PathfinderStdProbation,
            Role.PathfinderHQ,
            Role.PathfinderUser,
            Role.PathfinderLocalReader,
            Role.PathfinderNationalReader,
            Role.PathfinderPolice,
            Role.PathfinderPsychologist,
          ],
          user.userRoles,
        ),
        edit: userHasRoles(
          [
            Role.PathfinderApproval,
            Role.PathfinderStdPrison,
            Role.PathfinderStdProbation,
            Role.PathfinderHQ,
            Role.PathfinderUser,
          ],
          user.userRoles,
        ),
      },
      soc: {
        view: userHasRoles([Role.SocCommunity, Role.SocCustody], user.userRoles),
        edit: userHasRoles(
          [Role.SocCustody, Role.SocCommunity, Role.SocDataAnalyst, Role.SocDataManager],
          user.userRoles,
        ),
      },
      offenderCategorisation: {
        view: false,
        edit: userHasRoles(
          [
            Role.CreateCategorisation,
            Role.ApproveCategorisation,
            Role.CreateRecategorisation,
            Role.CategorisationSecurity,
          ],
          user.userRoles,
        ),
      },
      probationDocuments: {
        view:
          userHasRoles([Role.PomUser, Role.ViewProbationDocuments], user.userRoles) &&
          (isInUsersCaseLoad(prisoner.prisonId, user) || ['OUT', 'TRN'].includes(prisoner.prisonId)),
      },
    }
  }

  public getMoneyPermissions(user: HmppsUser, prisoner: Prisoner, _clientToken?: string): Permissions {
    if (prisoner.prisonId === 'OUT') return { accessCode: HmppsStatusCode.PRISONER_IS_RELEASED }
    if (prisoner.prisonId === 'TRN') return { accessCode: HmppsStatusCode.PRISONER_IS_TRANSFERRING }
    if (!isInUsersCaseLoad(prisoner.prisonId, user)) return { accessCode: HmppsStatusCode.NOT_IN_CASELOAD }

    return {
      accessCode: getOverviewAccessStatusCode(user, prisoner),
    }
  }
}
