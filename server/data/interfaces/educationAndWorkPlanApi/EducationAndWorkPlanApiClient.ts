import GetGoalsResponse from './GetGoalsResponse'

/**
 * Interface defining the REST API operations of the Education And Work Plan API (aka. the PLP API)
 */
export default interface EducationAndWorkPlanApiClient {
  getActiveGoals(prisonerNumber: string): Promise<GetGoalsResponse>
}
