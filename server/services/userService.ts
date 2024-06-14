import CaseLoad from '../data/interfaces/prisonApi/CaseLoad'
import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import StaffRole from '../data/interfaces/prisonApi/StaffRole'
import { HmppsUser } from '../interfaces/HmppsUser'

export default class UserService {
  constructor(private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>) {}

  getUserCaseLoads(token: string): Promise<CaseLoad[]> {
    return this.prisonApiClientBuilder(token).getUserCaseLoads()
  }

  getStaffRoles(token: string, user: HmppsUser): Promise<StaffRole[]> {
    if (user.authSource !== 'nomis' || !user.activeCaseLoadId) {
      return Promise.resolve([])
    }
    return this.prisonApiClientBuilder(token).getStaffRoles(user.staffId, user.activeCaseLoadId)
  }
}
