import { HmppsStatusCode } from '../data/enums/hmppsStatusCode'
import type Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import { type HmppsUser } from '../interfaces/HmppsUser'
import UserService from './userService'
import getOverviewAccessStatusCode from './utils/permissions/access/getOverviewAccessStatusCode'
import getMoneyAccessStatusCode from './utils/permissions/access/getMoneyAccessStatusCode'
import getCaseNotesAccessStatusCode from './utils/permissions/access/getCaseNotesAccessStatusCode'
import getSensitiveCaseNotesPermissions from './utils/permissions/getSensitiveCaseNotesPermissions'
import type PermissionItem from './interfaces/permissionsService/PermissionItem'
import getProbationDocumentsPermissions from './utils/permissions/getProbationDocumentsPermissions'
import getOffenderCategorisationPermissions from './utils/permissions/getOffenderCategorisationPermissions'
import getSocPermissions from './utils/permissions/getSocPermissions'
import getPathfinderPermissions from './utils/permissions/getPathfinderPermissions'
import getActivityPermissions from './utils/permissions/getActivityPermissions'
import getAppointmentPermissions from './utils/permissions/getAppointmentPermissions'
import getCaseNotesPermissions from './utils/permissions/getCaseNotesPermissions'
import getCalculateReleaseDatesPermissions from './utils/permissions/getCalculateReleaseDatesPermissions'
import getCategoryPermissions from './utils/permissions/getCategoryPermissions'
import getIncentivesPermissions from './utils/permissions/getIncentivesPermissions'
import getVisitsPermissions from './utils/permissions/getVisitsPermissions'
import getMoneyPermissions from './utils/permissions/getMoneyPermissions'
import getAdjudicationsPermissions from './utils/permissions/getAdjudicationsPermissions'
import getCourtCasesPermissions from './utils/permissions/getCourtCasesPermissions'
import getUseOfForcePermissions from './utils/permissions/getUseOfForcePermissions'
import getActiveCaseLoadOnlyAccessStatusCode from './utils/permissions/access/getActiveCaseLoadOnlyAccessStatusCode'
import getAlertsPermissions from './utils/permissions/getAlertsPermissions'
import getCellMovePermissions from './utils/permissions/getCellMovePermissions'
import getProbationDocumentsAccessStatusCode from './utils/permissions/access/getProbationDocumentsAccessStatusCode'
import getCSIPPermissions from './utils/permissions/getCSIPPermissions'

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
  appointment?: PermissionItem
  useOfForce?: PermissionItem
  activity?: PermissionItem
  pathfinder?: PermissionItem
  soc?: PermissionItem
  offenderCategorisation?: PermissionItem
  probationDocuments?: PermissionItem
  sensitiveCaseNotes?: PermissionItem
  alerts?: PermissionItem
  cellMove?: PermissionItem
  csip?: PermissionItem
}

export default class PermissionsService {
  constructor(private readonly userService: UserService) {
    this.getOverviewPermissions = this.getOverviewPermissions.bind(this)
  }

  public async getOverviewPermissions(user: HmppsUser, prisoner: Prisoner): Promise<Permissions> {
    const accessCode = getOverviewAccessStatusCode(user, prisoner)
    if (accessCode !== HmppsStatusCode.OK) return { accessCode }

    return {
      accessCode,
      courtCases: getCourtCasesPermissions(user),
      money: getMoneyPermissions(user, prisoner),
      adjudications: getAdjudicationsPermissions(user, prisoner),
      visits: getVisitsPermissions(user, prisoner),
      incentives: getIncentivesPermissions(user, prisoner),
      category: getCategoryPermissions(user),
      calculateReleaseDates: getCalculateReleaseDatesPermissions(user),
      caseNotes: getCaseNotesPermissions(user, prisoner),
      appointment: getAppointmentPermissions(user, prisoner),
      useOfForce: getUseOfForcePermissions(user, prisoner),
      activity: getActivityPermissions(user, prisoner),
      pathfinder: getPathfinderPermissions(user),
      soc: getSocPermissions(user),
      offenderCategorisation: getOffenderCategorisationPermissions(user),
      probationDocuments: getProbationDocumentsPermissions(user, prisoner),
      csip: getCSIPPermissions(user, prisoner),
    }
  }

  public getMoneyPermissions(user: HmppsUser, prisoner: Prisoner, _clientToken?: string): Permissions {
    return { accessCode: getMoneyAccessStatusCode(user, prisoner) }
  }

  public getCaseNotesPermissions(user: HmppsUser, prisoner: Prisoner, _clientToken?: string): Permissions {
    const accessCode = getCaseNotesAccessStatusCode(user, prisoner)
    if (accessCode !== HmppsStatusCode.OK) return { accessCode }

    return {
      accessCode,
      sensitiveCaseNotes: getSensitiveCaseNotesPermissions(user),
    }
  }

  public getStandardAccessPermission(user: HmppsUser, prisoner: Prisoner): Permissions {
    return { accessCode: getOverviewAccessStatusCode(user, prisoner) }
  }

  public getAppointmentPermissions(user: HmppsUser, prisoner: Prisoner): Permissions {
    return { accessCode: getActiveCaseLoadOnlyAccessStatusCode(user, prisoner) }
  }

  public getAlertsPermissions(user: HmppsUser, prisoner: Prisoner): Permissions {
    const accessCode = getOverviewAccessStatusCode(user, prisoner)
    if (accessCode !== HmppsStatusCode.OK) return { accessCode }

    return {
      accessCode,
      alerts: getAlertsPermissions(user, prisoner),
    }
  }

  public getEditAlertsPermissions(user: HmppsUser, prisoner: Prisoner): Permissions {
    const alertsPermissions = getAlertsPermissions(user, prisoner)
    const accessCode = alertsPermissions?.edit ? HmppsStatusCode.OK : HmppsStatusCode.NOT_FOUND

    return { accessCode, alerts: alertsPermissions }
  }

  public getLocationPermissions(user: HmppsUser, prisoner: Prisoner): Permissions {
    const accessCode = getOverviewAccessStatusCode(user, prisoner, { allowGlobal: false })
    if (accessCode !== HmppsStatusCode.OK) return { accessCode }

    return {
      accessCode,
      cellMove: getCellMovePermissions(user),
    }
  }

  public getProbationDocumentsPermissions(user: HmppsUser, prisoner: Prisoner): Permissions {
    return { accessCode: getProbationDocumentsAccessStatusCode(user, prisoner) }
  }
}
