import { convertToTitleCase } from '../utils/utils'
import type HmppsAuthClient from '../data/hmppsAuthClient'
import { CaseLoad } from '../interfaces/caseLoad'
import { Location } from '../interfaces/location'
import PrisonApiClient from '../data/prisonApiClient'

export interface UserDetails {
  name: string
  displayName: string
  locations: Location[]
  activeCaseLoadId?: string
  activeCaseLoad?: CaseLoad
}

export default class UserService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getUser(token: string): Promise<UserDetails> {
    const [user, locations] = await Promise.all([
      this.hmppsAuthClient.getUser(token),
      new PrisonApiClient(token).getUserLocations(),
    ])
    return { ...user, locations, displayName: convertToTitleCase(user.name) }
  }

  getUserCaseLoads(token: string): Promise<CaseLoad[]> {
    return new PrisonApiClient(token).getUserCaseLoads()
  }
}
