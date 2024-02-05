import { PersonalLearningPlanActionPlan } from '../interfaces/personalLearningPlanGoals'
import PersonalLearningPlanService from './personalLearningPlanService'

/**
 * A simple noop implementation of [PersonalLearningPlanService] used when the feature toggle is disabled.
 *
 * TODO - remove this class when the feature toggle is removed in RR-607
 */
export default class NoOpPersonalLearningPlanService extends PersonalLearningPlanService {
  constructor() {
    super()
  }

  async getPrisonerActionPlan(_prisonerNumber: string, _systemToken: string): Promise<PersonalLearningPlanActionPlan> {
    return undefined
  }
}
