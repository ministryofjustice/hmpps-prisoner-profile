import { HmppsStatusCode } from '../data/enums/hmppsStatusCode'
import type Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import { type HmppsUser } from '../interfaces/HmppsUser'
import getOverviewAccessStatusCode from './utils/permissions/access/getOverviewAccessStatusCode'
import getMoneyAccessStatusCode from './utils/permissions/access/getMoneyAccessStatusCode'
import type PermissionItem from './interfaces/permissionsService/PermissionItem'
import getAlertsPermissions from './utils/permissions/getAlertsPermissions'
import getCellMovePermissions from './utils/permissions/getCellMovePermissions'
import getProbationDocumentsAccessStatusCode from './utils/permissions/access/getProbationDocumentsAccessStatusCode'

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
  public getMoneyPermissions(user: HmppsUser, prisoner: Prisoner, _clientToken?: string): Permissions {
    return { accessCode: getMoneyAccessStatusCode(user, prisoner) }
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
