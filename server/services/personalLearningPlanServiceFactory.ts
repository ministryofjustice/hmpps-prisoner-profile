import { DataAccess } from '../data'
import EducationAndWorkPlanApiPersonalLearningPlanService from './educationAndWorkPlanApiPersonalLearningPlanService'
import PersonalLearningPlanService from './personalLearningPlanService'

export default class PersonalLearningPlanServiceFactory {
  private static instance: PersonalLearningPlanService

  /**
   * Static factory method to return the [PersonalLearningPlanService] instance.
   * @param dataAccess allows the instance to be created with any dataAccess property as a dependency
   */
  static getInstance = (dataAccess: DataAccess): PersonalLearningPlanService => {
    if (!PersonalLearningPlanServiceFactory.instance) {
      PersonalLearningPlanServiceFactory.instance = new EducationAndWorkPlanApiPersonalLearningPlanService(
        dataAccess.educationAndWorkPlanApiClientBuilder,
      )
    }
    return PersonalLearningPlanServiceFactory.instance
  }
}
