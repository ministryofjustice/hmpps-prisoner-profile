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

  async getLearnerEmployabilitySkills(offenderNumber: string): Promise<LearnerEmployabilitySkills | null> {
    return this.getAndIgnore404({
      path: `/learnerEmployabilitySkills/${offenderNumber}`,
    })
  }

  async getLearnerProfile(offenderNumber: string): Promise<LearnerProfile[] | null> {
    return this.getAndIgnore404({
      path: `/learnerProfile/${offenderNumber}`,
    })
  }

  async getLearnerEducationPage(offenderNumber: string, page = 0): Promise<LearnerEductionPagedResponse | null> {
    return this.getAndIgnore404({
      path: `/learnerEducation/${offenderNumber}`,
      query: {
        page,
      },
    })
  }

  async getLearnerLatestAssessments(offenderNumber: string): Promise<LearnerLatestAssessment[] | null> {
    return this.getAndIgnore404({
      path: `/latestLearnerAssessments/${offenderNumber}`,
    })
  }

  async getLearnerGoals(offenderNumber: string): Promise<LearnerGoals | null> {
    return this.getAndIgnore404({
      path: `/learnerGoals/${offenderNumber}`,
    })
  }

  async getLearnerNeurodivergence(offenderNumber: string): Promise<LearnerNeurodivergence[] | null> {
    return this.getAndIgnore404({
      path: `/learnerNeurodivergence/${offenderNumber}`,
    })
  }
}
