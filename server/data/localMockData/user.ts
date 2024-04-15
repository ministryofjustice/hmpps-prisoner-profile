import CaseLoad from '../interfaces/prisonApi/CaseLoad'
import { User } from '../interfaces/manageUsersApi/User'

export const userMock: User = {
  name: 'John Smith',
  caseLoads: [{ caseLoadId: 'MDI', currentlyActive: true } as CaseLoad],
  activeCaseLoadId: 'MDI',
  userRoles: [],
}
