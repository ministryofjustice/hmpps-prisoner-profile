/**
 * GetEmployabilitySkillsResponse type - manually implemented here by copying it from the Education And Work Plan API swagger spec:
 * https://learningandworkprogress-api-dev.hmpps.service.justice.gov.uk/v3/api-docs
 */
export default interface GetEmployabilitySkillsResponse {
  /**
   * @description The DPS username of the person who created this resource.
   * @example asmith_gen
   */
  createdBy: string
  /**
   * @description The display name of the person who created this resource.
   * @example Alex Smith
   */
  createdByDisplayName: string
  /**
   * Format: date-time
   * @description An ISO-8601 timestamp representing when this resource was created.
   * @example 2023-06-19T09:39:44Z
   */
  createdAt: string
  /**
   * @description The identifier of the prison that the prisoner was resident at when this resource was created.
   * @example BXI
   */
  createdAtPrison: string
  /**
   * @description The DPS username of the person who last updated this resource.
   * @example asmith_gen
   */
  updatedBy: string
  /**
   * @description The display name of the person who last updated this resource.
   * @example Alex Smith
   */
  updatedByDisplayName: string
  /**
   * Format: date-time
   * @description An ISO-8601 timestamp representing when this resource was last updated. This will be the same as the created date if it has not yet been updated.
   * @example 2023-06-19T09:39:44Z
   */
  updatedAt: string
  /**
   * @description The identifier of the prison that the prisoner was resident at when this resource was updated.
   * @example BXI
   */
  updatedAtPrison: string
  /**
   * @example null
   * @enum {string}
   */
  employabilitySkillType:
    | 'TEAMWORK'
    | 'TIMEKEEPING'
    | 'COMMUNICATION'
    | 'PLANNING'
    | 'ORGANISATION'
    | 'PROBLEM_SOLVING'
    | 'INITIATIVE'
    | 'ADAPTABILITY'
    | 'RELIABILITY'
    | 'CREATIVITY'
  /**
   * @example null
   * @enum {string}
   */
  employabilitySkillRating: 'NOT_CONFIDENT' | 'LITTLE_CONFIDENCE' | 'QUITE_CONFIDENT' | 'VERY_CONFIDENT'
  /**
   * @description Any evidence to support the skill rating.
   * @example null
   */
  evidence: string
  /**
   * @example null
   * @enum {string|null}
   */
  sessionType?: 'CIAG_INDUCTION' | 'CIAG_REVIEW' | 'EDUCATION_REVIEW' | 'INDUSTRIES_REVIEW'
  /**
   * @description Free text about the session type eg Mathematics A level.
   * @example null
   */
  sessionTypeDescription?: string
}
