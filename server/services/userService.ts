import { convertToTitleCase } from '../utils/utils'
import type HmppsAuthClient from '../data/hmppsAuthClient'
import { CaseLoad } from '../interfaces/caseLoad'
import { Location } from '../interfaces/location'
import PrisonApiClient from '../data/prisonApiClient'

export interface UserDetails {
  name: string
  displayName: string
  locations: Location[]
  caseLoads: CaseLoad[]
  activeCaseLoadId?: string
  activeCaseLoad?: CaseLoad
}

export default class UserService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getUser(token: string): Promise<UserDetails> {
    const [user, locations, caseLoads] = await Promise.all([
      this.hmppsAuthClient.getUser(token),
      new PrisonApiClient(token).getUserLocations(),
      new PrisonApiClient(token).getUserCaseLoads(),
    ])
    const activeCaseLoad = caseLoads.filter((caseLoad: CaseLoad) => caseLoad.currentlyActive)[0]
    return { ...user, locations, caseLoads, activeCaseLoad, displayName: convertToTitleCase(user.name) }
  }
}
