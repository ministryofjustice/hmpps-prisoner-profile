import CircuitBreaker from 'opossum'
import type { AllAssessmentDTO, AllQualificationsDTO } from 'curiousApiClient'
import RestClient, { Request } from './restClient'
import config from '../config'
import CuriousApiClient from './interfaces/curiousApi/curiousApiClient'
import LearnerEmployabilitySkills from './interfaces/curiousApi/LearnerEmployabilitySkills'
import { LearnerEductionPagedResponse } from './interfaces/curiousApi/LearnerEducation'
import { LearnerLatestAssessment } from './interfaces/curiousApi/LearnerLatestAssessment'
import LearnerGoals from './interfaces/curiousApi/LearnerGoals'
import LearnerNeurodivergence from './interfaces/curiousApi/LearnerNeurodivergence'
import { CuriousApiToken } from './hmppsAuthClient'

export default class CuriousRestApiClient extends RestClient implements CuriousApiClient {
  constructor(token: CuriousApiToken, circuitBreaker?: CircuitBreaker<[Request<unknown, unknown>, string], unknown>) {
    super('Curious API', config.apis.curiousApiUrl, token.curiousApiToken, circuitBreaker)
  }

  async getLearnerEmployabilitySkills(offenderNumber: string): Promise<LearnerEmployabilitySkills | null> {
    return this.getAndIgnore404({
      path: `/learnerEmployabilitySkills/${offenderNumber}`,
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

  async getLearnerAssessments(offenderNumber: string): Promise<AllAssessmentDTO> {
    return this.getAndIgnore404({
      path: `/learnerAssessments/v2/${offenderNumber}`,
    })
  }

  async getLearnerQualifications(offenderNumber: string): Promise<AllQualificationsDTO> {
    return this.getAndIgnore404({
      path: `/learnerQualifications/v2/${offenderNumber}`,
    })
  }
}
