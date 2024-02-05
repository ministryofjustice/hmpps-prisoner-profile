import { PersonalLearningPlanActionPlan } from '../interfaces/personalLearningPlanGoals'

/**
 * Abstract class defining the Personal Learning Plan service methods.
 *
 * Concrete implementations are free to use whatever API or other data source in order to implement the service methods.
 * The use of this interface and the data type abstractions allow other implementations that use other API data sources
 * to be swapped in as and when necessary.
 */
export default abstract class PersonalLearningPlanService {
  abstract getPrisonerActionPlan(prisonerNumber: string, systemToken: string): Promise<PersonalLearningPlanActionPlan>
}
