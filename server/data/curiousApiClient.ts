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

export default class CuriousRestApiClient extends RestClient implements CuriousApiClient {
  constructor(token: CuriousApiToken) {
    super('Curious API', config.apis.curiousApiUrl, token.curiousApiToken)
  }

  async getLearnerEmployabilitySkills(offenderNumber: string): Promise<LearnerEmployabilitySkills> {
    return this.getAndIgnore404<LearnerEmployabilitySkills>({
      path: `/learnerEmployabilitySkills/${offenderNumber}`,
    })
  }

  async getLearnerProfile(offenderNumber: string): Promise<LearnerProfile[]> {
    return this.getAndIgnore404<LearnerProfile[]>({
      path: `/learnerProfile/${offenderNumber}`,
    })
  }

  async getLearnerEducationPage(offenderNumber: string, page = 0): Promise<LearnerEductionPagedResponse> {
    return this.getAndIgnore404<LearnerEductionPagedResponse>({
      path: `/learnerEducation/${offenderNumber}`,
      query: {
        page,
      },
    })
  }

  async getLearnerLatestAssessments(offenderNumber: string): Promise<LearnerLatestAssessment[]> {
    return this.getAndIgnore404<LearnerLatestAssessment[]>({
      path: `/latestLearnerAssessments/${offenderNumber}`,
    })
  }

  async getLearnerGoals(offenderNumber: string): Promise<LearnerGoals> {
    return this.getAndIgnore404<LearnerGoals>({
      path: `/learnerGoals/${offenderNumber}`,
    })
  }

  async getLearnerNeurodivergence(offenderNumber: string): Promise<LearnerNeurodivergence[]> {
    return this.getAndIgnore404<LearnerNeurodivergence[]>({
      path: `/learnerNeurodivergence/${offenderNumber}`,
    })
  }
}
