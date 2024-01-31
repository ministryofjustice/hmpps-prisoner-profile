import { ActionPlanResponse } from '../../interfaces/educationAndWorkPlanApi/actionPlanResponse'

/**
 * Interface defining the REST API operations of the Education And Work Plan API (aka. the PLP API)
 */
export interface EducationAndWorkPlanApiClient {
  getPrisonerActionPlan(prisonerNumber: string): Promise<ActionPlanResponse>
}
