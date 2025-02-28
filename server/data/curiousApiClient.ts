import RestClient from './restClient'
import config from '../config'
import CuriousApiClient from './interfaces/curiousApi/curiousApiClient'
import LearnerEmployabilitySkills from './interfaces/curiousApi/LearnerEmployabilitySkills'
import LearnerProfile from './interfaces/curiousApi/LearnerProfile'
import { LearnerEductionPagedResponse } from './interfaces/curiousApi/LearnerEducation'
import LearnerLatestAssessment from './interfaces/curiousApi/LearnerLatestAssessment'
import LearnerGoals from './interfaces/curiousApi/LearnerGoals'
import LearnerNeurodivergence from './interfaces/curiousApi/LearnerNeurodivergence'
import { CuriousApiToken } from './hmppsAuthClient'

export default class CuriousRestApiClient implements CuriousApiClient {
  private readonly restClient: RestClient

  constructor(token: CuriousApiToken) {
    this.restClient = new RestClient('Curious API', config.apis.curiousApiUrl, token.curiousApiToken)
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

  async getLearnerEducationPage(offenderNumber: string, page = 0): Promise<LearnerEductionPagedResponse> {
    return this.restClient.get<LearnerEductionPagedResponse>({
      path: `/learnerEducation/${offenderNumber}`,
      query: {
        page,
      },
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
