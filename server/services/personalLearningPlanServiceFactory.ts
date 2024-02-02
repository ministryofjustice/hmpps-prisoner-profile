import { DataAccess } from '../data'
import config from '../config'
import EducationAndWorkPlanApiPersonalLearningPlanService from './educationAndWorkPlanApiPersonalLearningPlanService'
import NoOpPersonalLearningPlanService from './noOpPersonalLearningPlanService'
import PersonalLearningPlanService from './personalLearningPlanService'

export default class PersonalLearningPlanServiceFactory {
  private static instance: PersonalLearningPlanService

  /**
   * Static factory method to return the [PersonalLearningPlanService] instance.
   * @param dataAccess allows the instance to be created with any dataAccess property as a dependency
   */
  static getInstance = (dataAccess: DataAccess): PersonalLearningPlanService => {
    if (!PersonalLearningPlanServiceFactory.instance) {
      // TODO - feature toggle logic to be removed in RR-607
      PersonalLearningPlanServiceFactory.instance = config.featureToggles.newWorkAndSkillsTabEnabled
        ? new EducationAndWorkPlanApiPersonalLearningPlanService(dataAccess.educationAndWorkPlanApiClientBuilder)
        : new NoOpPersonalLearningPlanService()
    }
    return PersonalLearningPlanServiceFactory.instance
  }
}
