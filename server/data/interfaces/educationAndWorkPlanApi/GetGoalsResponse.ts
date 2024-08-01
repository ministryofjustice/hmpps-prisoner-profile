import GoalResponse from './GoalResponse'

/**
 * GetGoalsResponse type - manually implemented here by copying it from the Education And Work Plan API swagger spec:
 * https://learningandworkprogress-api-dev.hmpps.service.justice.gov.uk/v3/api-docs
 */
export default interface GetGoalsResponse {
  /**
   * @description A List of at least one or more Goals.
   * @example null
   */
  goals: Array<GoalResponse>
}
