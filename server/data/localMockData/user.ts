import type { AzureADUser, ExternalUser, PrisonUser, ProbationUser } from '../../interfaces/HmppsUser'
import { CaseLoadsDummyDataA } from './caseLoad'
import { Role } from '../enums/role'

const baseUser = {
  username: 'JSMITH_GEN',
  userId: '1111',
  userUuid: '11111111-1111-1111-1111-111111111111' as const,
  name: 'JOHN SMITH',
  displayName: 'John Smith',
  userRoles: [Role.PrisonUser],
  token: 'ighf84',
}

export const prisonUserMock: PrisonUser = {
  authSource: 'nomis',
  ...baseUser,
  staffId: 1111,
  caseLoads: CaseLoadsDummyDataA,
  activeCaseLoadId: CaseLoadsDummyDataA[0].caseLoadId,
}
export const azureUserMock: AzureADUser = { authSource: 'azuread', ...baseUser }
export const externalUserMock: ExternalUser = { authSource: 'external', ...baseUser }
export const probationUserMock: ProbationUser = { authSource: 'delius', ...baseUser }
