import GetEmployabilitySkillsResponse from './GetEmployabilitySkillsResponse'

/**
 * GetEmployabilitySkillResponses type - manually implemented here by copying it from the Education And Work Plan API swagger spec:
 * https://learningandworkprogress-api-dev.hmpps.service.justice.gov.uk/v3/api-docs
 */
export default interface GetEmployabilitySkillResponses {
  /**
   * @description A List of at least one employability skill.
   * @example null
   */
  employabilitySkills: GetEmployabilitySkillsResponse[]
}
