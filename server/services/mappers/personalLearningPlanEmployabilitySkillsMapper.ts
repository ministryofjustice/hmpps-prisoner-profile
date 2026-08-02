import { parseISO } from 'date-fns'
import { PersonalLearningPlanEmployabilitySkill } from '../interfaces/educationAndWorkPlanApiPersonalLearningPlanService/PersonalLearningPlanViewModels'
import GetEmployabilitySkillResponses from '../../data/interfaces/educationAndWorkPlanApi/GetEmployabilitySkillResponses'

/**
 * Simple mapper function to map from the Education And Work Plan (PLP) API type [GetEmployabilitySkillResponses]
 * into an array of view model type [PersonalLearningPlanEmployabilitySkill]
 */
const toPersonalLearningPlanEmployabilitySkills = (
  apiGetEmployabilitySkillsResponse: GetEmployabilitySkillResponses,
): Array<PersonalLearningPlanEmployabilitySkill> =>
  apiGetEmployabilitySkillsResponse.employabilitySkills.map(employabilitySkill => ({
    employabilitySkillType: employabilitySkill.employabilitySkillType,
    employabilitySkillRating: employabilitySkill.employabilitySkillRating,
    evidence: employabilitySkill.evidence,
    sessionType: employabilitySkill.sessionType,
    sessionTypeDescription: employabilitySkill.sessionTypeDescription,
    createdAt: parseISO(employabilitySkill.createdAt),
    createdBy: employabilitySkill.createdBy,
    createdByDisplayName: employabilitySkill.createdByDisplayName,
    updatedAt: parseISO(employabilitySkill.updatedAt),
    updatedBy: employabilitySkill.updatedBy,
    updatedByDisplayName: employabilitySkill.updatedByDisplayName,
  }))

export default toPersonalLearningPlanEmployabilitySkills
