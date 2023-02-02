import { convertToTitleCase } from '../utils/utils'
import type HmppsAuthClient from '../data/hmppsAuthClient'

import { CaseLoad } from '../interfaces/caseLoad'
import { Location } from '../interfaces/location'
import PrisonApiClient from '../data/prisonApiClient'
import PrisonSearchClient from '../data/prisonerSearchClient'
import { Prisoner } from '../interfaces/prisoner'

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

  getUserRoles(token: string): Promise<string[]> {
    return this.hmppsAuthClient.getUserRoles(token)
  }

  getUserLocations(token: string): Promise<Location[]> {
    return new PrisonApiClient(token).getUserLocations()
  }

  getUserCaseLoads(token: string): Promise<CaseLoad[]> {
    return new PrisonApiClient(token).getUserCaseLoads()
  }

  getPrisonerDetails(token: string, prisonerNumber: string): Promise<Prisoner> {
    return new PrisonSearchClient(token).getPrisonerDetails(prisonerNumber)
  }
}
