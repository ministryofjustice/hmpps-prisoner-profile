import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import StaffRole from '../data/interfaces/prisonApi/StaffRole'
import { HmppsUser } from '../interfaces/HmppsUser'

export default class UserService {
  constructor(private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>) {}

  async getStaffRoles(token: string, user: HmppsUser): Promise<StaffRole[]> {
    if (user.authSource !== 'nomis' || !user.activeCaseLoadId) {
      return Promise.resolve([])
    }
    const roles = await this.prisonApiClientBuilder(token).getStaffRoles(user.staffId, user.activeCaseLoadId)
    return roles ?? []
  }
}
