import { User } from '../hmppsAuthClient'
import CaseLoad from '../interfaces/prisonApi/CaseLoad'

export const userMock: User = {
  name: 'John Smith',
  caseLoads: [{ caseLoadId: 'MDI', currentlyActive: true } as CaseLoad],
  activeCaseLoadId: 'MDI',
  userRoles: [],
}
