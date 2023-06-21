import { convertToTitleCase } from '../utils/utils'
import type HmppsAuthClient from '../data/hmppsAuthClient'
import { CaseLoad } from '../interfaces/caseLoad'
import PrisonApiClient from '../data/prisonApiClient'
import { RestClientBuilder } from '../data'

export interface UserDetails {
  name: string
  displayName: string
  activeCaseLoadId?: string
  activeCaseLoad?: CaseLoad
}

export default class UserService {
  constructor(private readonly hmppsAuthClientBuilder: RestClientBuilder<HmppsAuthClient>) {}

  async getUser(token: string): Promise<UserDetails> {
    const user = await this.hmppsAuthClientBuilder(token).getUser()
    return { ...user, displayName: convertToTitleCase(user.name) }
  }

  getUserCaseLoads(token: string): Promise<CaseLoad[]> {
    return new PrisonApiClient(token).getUserCaseLoads()
  }
}
