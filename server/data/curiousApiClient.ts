import RestClient from './restClient'
import config from '../config'
import { LearnerEmployabilitySkills } from '../interfaces/learnerEmployabilitySkills'
import { LearnerProfile } from '../interfaces/learnerProfile'

export default class CuriousApiClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Curious API', config.apis.curiousApiUrl, token)
  }

  async getLearnerEmployabilitySkills(offenderNumber: string): Promise<LearnerEmployabilitySkills> {
    try {
      return await this.restClient.get<LearnerEmployabilitySkills>({
        path: `/learnerEmployabilitySkills/${offenderNumber}`,
      })
    } catch (error) {
      return error
    }
  }

  async getLearnerProfile(offenderNumber: string): Promise<LearnerProfile[]> {
    try {
      return await this.restClient.get<LearnerProfile[]>({
        path: `/learnerProfile/${offenderNumber}`,
      })
    } catch (error) {
      return error
    }
  }
}
