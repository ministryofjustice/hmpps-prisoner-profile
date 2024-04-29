import CaseLoad from '../data/interfaces/prisonApi/CaseLoad'
import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import StaffRole from '../data/interfaces/prisonApi/StaffRole'

export default class UserService {
  constructor(private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>) {}

  getUserCaseLoads(token: string): Promise<CaseLoad[]> {
    return this.prisonApiClientBuilder(token).getUserCaseLoads()
  }

  getStaffRoles(token: string, staffId: number, agencyId: string): Promise<StaffRole[]> {
    return this.prisonApiClientBuilder(token).getStaffRoles(staffId, agencyId)
  }
}
