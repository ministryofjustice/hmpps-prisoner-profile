import { CaseLoad } from '../interfaces/caseLoad'
import { Location } from '../interfaces/location'
import PrisonApiClient from '../data/prisonApiClient'

export default class PrisonApiService {
  constructor(private readonly prisonApiClient: PrisonApiClient) {}

  async getUserLocations(token: string): Promise<Location[]> {
    const locations = await this.prisonApiClient.getUserLocations(token)
    return locations
  }

  async getUserCaseLoads(token: string): Promise<CaseLoad[]> {
    const caseLoads = await this.prisonApiClient.getUserCaseLoads(token)
    return caseLoads
  }
}
