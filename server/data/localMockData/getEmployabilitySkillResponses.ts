import GetEmployabilitySkillResponses from '../interfaces/educationAndWorkPlanApi/GetEmployabilitySkillResponses'
import GetEmployabilitySkillsResponse from '../interfaces/educationAndWorkPlanApi/GetEmployabilitySkillsResponse'
import aValidGetEmployabilitySkillsResponse from './getEmployabilitySkillsResponse'

const aValidGetEmployabilitySkillResponses = (options?: {
  employabilitySkills?: GetEmployabilitySkillsResponse[]
}): GetEmployabilitySkillResponses => ({
  employabilitySkills: options?.employabilitySkills || [aValidGetEmployabilitySkillsResponse()],
})

export default aValidGetEmployabilitySkillResponses
