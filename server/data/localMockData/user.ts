import { User } from '../hmppsAuthClient'
import { CaseLoad } from '../../interfaces/caseLoad'

// eslint-disable-next-line import/prefer-default-export
export const userMock: User = {
  name: 'John Smith',
  caseLoads: [{ caseLoadId: 'MDI', currentlyActive: true } as CaseLoad],
  activeCaseLoadId: 'MDI',
  userRoles: [],
}
