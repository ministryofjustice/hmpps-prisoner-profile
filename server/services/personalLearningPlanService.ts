import { PersonalLearningPlanActionPlan } from '../interfaces/personalLearningPlanGoals'
import { DataAccess } from '../data'
// eslint-disable-next-line import/no-cycle
import EducationAndWorkPlanApiPersonalLearningPlanService from './educationAndWorkPlanApiPersonalLearningPlanService'

/**
 * Abstract class defining the Personal Learning Plan service methods and a factory method to return a concrete instance.
 *
 * Concrete implementations are free to use whatever API or other data source in order to implement the service methods.
 * The use of this interface and the data type abstractions allow other implementations that use other API data sources
 * to be swapped in as and when necessary.
 */
export default abstract class PersonalLearningPlanService {
  abstract getPrisonerActionPlan(prisonerNumber: string, systemToken: string): Promise<PersonalLearningPlanActionPlan>

  private static instance: PersonalLearningPlanService

  /**
   * Static factory method to return the [PersonalLearningPlanService] instance.
   * @param dataAccess allows the instance to be created with any dataAccess property as a dependency
   */
  static getInstance = (dataAccess: DataAccess): PersonalLearningPlanService => {
    if (!PersonalLearningPlanService.instance) {
      PersonalLearningPlanService.instance = new EducationAndWorkPlanApiPersonalLearningPlanService(
        dataAccess.educationAndWorkPlanApiClientBuilder,
      )
    }
    return PersonalLearningPlanService.instance
  }
}
