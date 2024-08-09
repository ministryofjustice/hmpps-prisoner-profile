import { RestClientBuilder } from '../data'
import EducationAndWorkPlanApiClient from '../data/interfaces/educationAndWorkPlanApi/EducationAndWorkPlanApiClient'
import { PersonalLearningPlanActionPlan } from './interfaces/educationAndWorkPlanApiPersonalLearningPlanService/PersonalLearningPlanGoals'
import toPersonalLearningPlanActionPlan from './mappers/personalLearningPlanActionPlanMapper'
import logger from '../../logger'
import PersonalLearningPlanService from './personalLearningPlanService'

/**
 * Implementation of [PersonalLearningPlanService] that uses the [EducationAndWorkPlanApiClient] as data source
 * for PLP related data.
 */
export default class EducationAndWorkPlanApiPersonalLearningPlanService extends PersonalLearningPlanService {
  constructor(private readonly educationAndWorkPlanApiClientBuilder: RestClientBuilder<EducationAndWorkPlanApiClient>) {
    super()
  }

  async getPrisonerActionPlan(prisonerNumber: string, systemToken: string): Promise<PersonalLearningPlanActionPlan> {
    try {
      const activeGoals = await this.educationAndWorkPlanApiClientBuilder(systemToken).getActiveGoals(prisonerNumber)
      return toPersonalLearningPlanActionPlan(prisonerNumber, activeGoals)
    } catch (error) {
      if (error.status === 404) {
        return toPersonalLearningPlanActionPlan(prisonerNumber, { goals: [] })
      }
      logger.error('Error calling the Education And Work Plan API to get the prisoner action plan', error)
      return { problemRetrievingData: true } as PersonalLearningPlanActionPlan
    }
  }
}
