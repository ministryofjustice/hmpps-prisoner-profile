import StepResponse from './StepResponse'

/**
 * GoalResponse type - manually implemented here by copying it from the Education And Work Plan API swagger spec:
 * https://learningandworkprogress-api-dev.hmpps.service.justice.gov.uk/v3/api-docs
 */
export default interface GoalResponse {
  /**
   * Format: uuid
   * @description The Goal's unique reference
   * @example c88a6c48-97e2-4c04-93b5-98619966447b
   */
  goalReference: string
  /**
   * @description A title explaining the aim of the goal.
   * @example Improve communication skills
   */
  title: string
  /**
   * Format: date
   * @description An optional ISO-8601 date representing the target completion date of the Goal.
   */
  targetCompletionDate: string
  /**
   * @example null
   * @enum {string}
   */
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'
  /**
   * @description A List of at least one Step.
   * @example null
   */
  steps: Array<StepResponse>
  /**
   * @description The DPS username of the person who created the goal.
   * @example asmith_gen
   */
  createdBy: string
  /**
   * @description The display name of the person who created the goal.
   * @example Alex Smith
   */
  createdByDisplayName: string
  /**
   * Format: date-time
   * @description An ISO-8601 timestamp representing when the Goal was created.
   * @example 2023-06-19T09:39:44Z
   */
  createdAt: string
  /**
   * @description The identifier of the prison that the prisoner was resident at when the Goal was created.
   * @example BXI
   */
  createdAtPrison: string
  /**
   * @description The DPS username of the person who last updated the goal.
   * @example asmith_gen
   */
  updatedBy: string
  /**
   * @description The display name of the person who last updated the goal.
   * @example Alex Smith
   */
  updatedByDisplayName: string
  /**
   * Format: date-time
   * @description An ISO-8601 timestamp representing when the Goal was last updated. This will be the same as the created date if it has not yet been updated.
   * @example 2023-06-19T09:39:44Z
   */
  updatedAt: string
  /**
   * @description The identifier of the prison that the prisoner was resident at when the Goal was updated.
   * @example BXI
   */
  updatedAtPrison: string
  /**
   * @description Some additional notes related to the Goal.
   * @example Pay close attention to Peter's behaviour.
   */
  notes?: string
}
