import RestClient from './restClient'
import config from '../config'
import { LearnerEmployabilitySkills } from '../interfaces/learnerEmployabilitySkills'
import { LearnerProfile } from '../interfaces/learnerProfile'
import { LearnerEducation } from '../interfaces/learnerEducation'
import { LearnerLatestAssessment } from '../interfaces/learnerLatestAssessments'
import { LearnerGoals } from '../interfaces/learnerGoals'
import { LearnerNeurodivergence } from '../interfaces/learnerNeurodivergence'
import { CuriousApiClient } from './interfaces/curiousApiClient'

export default class CuriousRestApiClient implements CuriousApiClient {
  constructor(private readonly restClient: RestClient) {}

  private async get<T>(args: object, localMockData?: T): Promise<T> {
    try {
      return await this.restClient.get<T>(args)
    } catch (error) {
      if (config.localMockData === 'true' && localMockData) {
        return localMockData
      }
      return error
    }
  }

  async getLearnerEmployabilitySkills(offenderNumber: string): Promise<LearnerEmployabilitySkills> {
    return this.get<LearnerEmployabilitySkills>({
      path: `/learnerEmployabilitySkills/${offenderNumber}`,
    })
  }

  async getLearnerProfile(offenderNumber: string): Promise<LearnerProfile[]> {
    return this.get<LearnerProfile[]>({
      path: `/learnerProfile/${offenderNumber}`,
    })
  }

  async getLearnerEducation(offenderNumber: string): Promise<LearnerEducation> {
    return this.get<LearnerEducation>({
      path: `/learnerEducation/${offenderNumber}`,
    })
  }

  async getLearnerLatestAssessments(offenderNumber: string): Promise<LearnerLatestAssessment[]> {
    return this.get<LearnerLatestAssessment[]>({
      path: `/latestLearnerAssessments/${offenderNumber}`,
    })
  }

  async getLearnerGoals(offenderNumber: string): Promise<LearnerGoals> {
    return this.get<LearnerGoals>({
      path: `/learnerGoals/${offenderNumber}`,
    })
  }

  async getLearnerNeurodivergence(offenderNumber: string): Promise<LearnerNeurodivergence[]> {
    return this.get<LearnerNeurodivergence[]>({
      path: `/learnerNeurodivergence/${offenderNumber}`,
    })
  }
}
