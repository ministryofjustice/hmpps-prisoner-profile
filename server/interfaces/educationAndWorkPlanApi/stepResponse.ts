/**
 * StepResponse type - manually implemented here by copying it from the Education And Work Plan API swagger spec:
 * https://learningandworkprogress-api-dev.hmpps.service.justice.gov.uk/v3/api-docs
 */
export interface StepResponse {
  /**
   * Format: uuid
   * @description A unique reference for the Step
   * @example d38a6c41-13d1-1d05-13c2-24619966119b
   */
  stepReference: string
  /**
   * @description A title describing the step
   * @example Book communication skills course
   */
  title: string
  /**
   * @example null
   * @enum {string}
   */
  status: 'NOT_STARTED' | 'ACTIVE' | 'COMPLETE'
  /**
   * Format: int32
   * @description The number (position) of the Step within the overall Goal.
   * @example 1
   */
  sequenceNumber: number
}
