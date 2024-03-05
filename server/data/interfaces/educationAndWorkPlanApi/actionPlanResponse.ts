import GoalResponse from './GoalResponse'

/**
 * ActionPlanResponse type - manually implemented here by copying it from the Education And Work Plan API swagger spec:
 * https://learningandworkprogress-api-dev.hmpps.service.justice.gov.uk/v3/api-docs
 */
export interface ActionPlanResponse {
  /**
   * Format: uuid
   * @description The Action Plan's unique reference
   * @example 814ade0a-a3b2-46a3-862f-79211ba13f7b
   */
  reference: string
  /**
   * @description The ID of the prisoner
   * @example A1234BC
   */
  prisonNumber: string
  /**
   * @description A List of at least one or more Goals.
   * @example null
   */
  goals: Array<GoalResponse>
  /**
   * Format: date
   * @description An optional ISO-8601 date representing when the Action Plan is up for review.
   */
  reviewDate?: string
}
