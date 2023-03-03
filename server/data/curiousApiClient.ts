import RestClient from './restClient'
import config from '../config'
import { LearnerEmployabilitySkills } from '../interfaces/learnerEmployabilitySkills'
import { LearnerProfile } from '../interfaces/learnerProfile'
import { LearnerEducation } from '../interfaces/learnerEducation'
import { LearnerLatestAssessment } from '../interfaces/learnerLatestAssessments'
import { LearnerGoals } from '../interfaces/learnerGoals'
import { LearnerNeurodivergence } from '../interfaces/learnerNeurodivergence'

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

  async getLearnerEducation(offenderNumber: string): Promise<LearnerEducation[]> {
    try {
      return await this.restClient.get<LearnerEducation[]>({
        path: `/learnerEducation/${offenderNumber}`,
      })
    } catch (error) {
      return error
    }
  }

  async getLearnerLatestAssessments(offenderNumber: string): Promise<LearnerLatestAssessment[]> {
    try {
      return await this.restClient.get<LearnerLatestAssessment[]>({
        path: `/latestLearnerAssessments/${offenderNumber}`,
      })
    } catch (error) {
      return error
    }
  }

  async getLearnerGoals(offenderNumber: string): Promise<LearnerGoals> {
    try {
      return await this.restClient.get<LearnerGoals>({
        path: `/learnerGoals/${offenderNumber}`,
      })
    } catch (error) {
      return error
    }
  }

  async getLearnerNeurodivergence(offenderNumber: string): Promise<LearnerNeurodivergence[]> {
    try {
      return await this.restClient.get<LearnerNeurodivergence[]>({
        path: `/learnerNeurodivergence/${offenderNumber}`,
      })
    } catch (error) {
      return error
    }
  }
}
