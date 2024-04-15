import { convertToTitleCase } from '../utils/utils'
import CaseLoad from '../data/interfaces/prisonApi/CaseLoad'
import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import { ManageUsersApiClient } from '../data/interfaces/manageUsersApi/manageUsersApiClient'
import StaffRole from '../data/interfaces/prisonApi/StaffRole'

export interface UserDetails {
  name: string
  displayName: string
  activeCaseLoadId?: string
  activeCaseLoad?: CaseLoad
}

export default class UserService {
  constructor(
    private readonly manageUsersApiClientBuilder: RestClientBuilder<ManageUsersApiClient>,
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
  ) {}

  async getUser(token: string): Promise<UserDetails> {
    const user = await this.manageUsersApiClientBuilder(token).getUser()
    return { ...user, displayName: convertToTitleCase(user.name) }
  }

  getUserCaseLoads(token: string): Promise<CaseLoad[]> {
    return this.prisonApiClientBuilder(token).getUserCaseLoads()
  }

  getStaffRoles(token: string, staffId: number, agencyId: string): Promise<StaffRole[]> {
    return this.prisonApiClientBuilder(token).getStaffRoles(staffId, agencyId)
  }
}
