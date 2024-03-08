import { ActionPlanResponse } from './actionPlanResponse'

/**
 * Interface defining the REST API operations of the Education And Work Plan API (aka. the PLP API)
 */
export default interface EducationAndWorkPlanApiClient {
  getPrisonerActionPlan(prisonerNumber: string): Promise<ActionPlanResponse>
}
