import CaseLoad from '../interfaces/prisonApi/CaseLoad'
import { PrisonUser } from '../../interfaces/HmppsUser'

export const prisonUserMock: PrisonUser = {
  authSource: 'nomis',
  username: 'JSMITH_GEN',
  userId: '1111',
  staffId: 1111,
  name: 'JOHN SMITH',
  displayName: 'John Smith',
  caseLoads: [{ caseLoadId: 'MDI', currentlyActive: true } as CaseLoad],
  activeCaseLoadId: 'MDI',
  userRoles: [],
}

export default { prisonUserMock }
