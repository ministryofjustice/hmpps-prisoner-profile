import { convertToTitleCase } from '../utils/utils'
import type HmppsAuthClient from '../data/hmppsAuthClient'
import { Location } from '../data/localMockData/locations'
import { CaseLoad } from '../data/localMockData/caseLoad'

interface UserDetails {
  name: string
  displayName: string
  activeCaseLoadId?: string
  activeCaseLoad?: CaseLoad
}

export default class UserService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getUser(token: string): Promise<UserDetails> {
    const user = await this.hmppsAuthClient.getUser(token)
    return { ...user, displayName: convertToTitleCase(user.name) }
  }

  async getUserLocations(token: string): Promise<Location[]> {
    const locations = await this.hmppsAuthClient.getUserLocations(token)
    return locations
  }

  async getUserRoles(token: string): Promise<string[]> {
    const roles = await this.hmppsAuthClient.getUserRoles(token)
    return roles
  }

  async getUserCaseLoads(token: string): Promise<CaseLoad[]> {
    const caseLoads = await this.hmppsAuthClient.getUserCaseLoads(token)
    return caseLoads
  }
}
