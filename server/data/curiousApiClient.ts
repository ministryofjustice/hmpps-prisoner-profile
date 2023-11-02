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
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Curious API', config.apis.curiousApiUrl, token)
  }

  async getLearnerEmployabilitySkills(offenderNumber: string): Promise<LearnerEmployabilitySkills> {
    return this.restClient.get<LearnerEmployabilitySkills>({
      path: `/learnerEmployabilitySkills/${offenderNumber}`,
      ignore404: true,
    })
  }

  async getLearnerProfile(offenderNumber: string): Promise<LearnerProfile[]> {
    return this.restClient.get<LearnerProfile[]>({
      path: `/learnerProfile/${offenderNumber}`,
      ignore404: true,
    })
  }

  async getLearnerEducation(offenderNumber: string): Promise<LearnerEducation> {
    return this.restClient.get<LearnerEducation>({
      path: `/learnerEducation/${offenderNumber}`,
      ignore404: true,
    })
  }

  async getLearnerLatestAssessments(offenderNumber: string): Promise<LearnerLatestAssessment[]> {
    return this.restClient.get<LearnerLatestAssessment[]>({
      path: `/latestLearnerAssessments/${offenderNumber}`,
      ignore404: true,
    })
  }

  async getLearnerGoals(offenderNumber: string): Promise<LearnerGoals> {
    return this.restClient.get<LearnerGoals>({
      path: `/learnerGoals/${offenderNumber}`,
      ignore404: true,
    })
  }

  async getLearnerNeurodivergence(offenderNumber: string): Promise<LearnerNeurodivergence[]> {
    return this.restClient.get<LearnerNeurodivergence[]>({
      path: `/learnerNeurodivergence/${offenderNumber}`,
      ignore404: true,
    })
  }
}
