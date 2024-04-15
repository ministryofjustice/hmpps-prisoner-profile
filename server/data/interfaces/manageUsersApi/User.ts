import CaseLoad from '../prisonApi/CaseLoad'

export interface User {
  name: string
  activeCaseLoadId: string
  userRoles: string[]
  caseLoads: CaseLoad[]
}
