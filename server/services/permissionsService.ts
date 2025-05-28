import { HmppsStatusCode } from '../data/enums/hmppsStatusCode'
import type Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import { type HmppsUser } from '../interfaces/HmppsUser'
import getMoneyAccessStatusCode from './utils/permissions/access/getMoneyAccessStatusCode'
import type PermissionItem from './interfaces/permissionsService/PermissionItem'

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
}
