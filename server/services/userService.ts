import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import { HmppsUser } from '../interfaces/HmppsUser'

export default class UserService {
  constructor(private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>) {}

  isUserAKeyWorker(token: string, user: HmppsUser, agencyId: string): Promise<boolean> {
    if (user.authSource !== 'nomis') return Promise.resolve(false)

    return this.prisonApiClientBuilder(token).hasStaffRole(user.staffId, agencyId, 'KW')
  }
}
