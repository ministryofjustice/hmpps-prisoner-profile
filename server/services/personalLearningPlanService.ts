import { PersonalLearningPlanActionPlan } from '../interfaces/personalLearningPlanGoals'
import { EducationAndWorkPlanApiClient } from '../data/interfaces/educationAndWorkPlanApiClient'
import { RestClientBuilder } from '../data'
import toPersonalLearningPlanActionPlan from '../interfaces/mappers/personalLearningPlanActionPlanMapper'
import logger from '../../logger'

/**
 * Interface defining the Personal Learning Plan service methods.
 *
 * Concrete implementations are free to use whatever API or other data source in order to implement the service methods.
 * The use of this interface and the data type abstractions allow other implementations that use other API data sources
 * to be swapped in as and when necessary.
 */
export interface PersonalLearningPlanService {
  getPrisonerActionPlan(prisonerNumber: string, systemToken: string): Promise<PersonalLearningPlanActionPlan>
}

/**
 * Implementation of [PersonalLearningPlanService] that uses the [EducationAndWorkPlanApiClient] as data source
 * for PLP related data.
 */
export class EducationAndWorkPlanApiPersonalLearningPlanService implements PersonalLearningPlanService {
  constructor(
    private readonly educationAndWorkPlanApiClientBuilder: RestClientBuilder<EducationAndWorkPlanApiClient>,
  ) {}

  async getPrisonerActionPlan(prisonerNumber: string, systemToken: string): Promise<PersonalLearningPlanActionPlan> {
    try {
      const plpActionPlan =
        await this.educationAndWorkPlanApiClientBuilder(systemToken).getPrisonerActionPlan(prisonerNumber)
      return toPersonalLearningPlanActionPlan(plpActionPlan)
    } catch (error) {
      logger.error('Error calling the Education And Work Plan API to get the prisoner action plan', error)
      return { problemRetrievingData: true } as PersonalLearningPlanActionPlan
    }
  }
}
