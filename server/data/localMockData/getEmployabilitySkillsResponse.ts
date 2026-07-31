import GetEmployabilitySkillsResponse from '../interfaces/educationAndWorkPlanApi/GetEmployabilitySkillsResponse'

const aValidGetEmployabilitySkillsResponse = (options?: {
  employabilitySkillType?:
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
  employabilitySkillRating?: 'NOT_CONFIDENT' | 'LITTLE_CONFIDENCE' | 'QUITE_CONFIDENT' | 'VERY_CONFIDENT'
  evidence?: string
  sessionType?: 'CIAG_INDUCTION' | 'CIAG_REVIEW' | 'EDUCATION_REVIEW' | 'INDUSTRIES_REVIEW' | null
  sessionTypeDescription?: string
  createdAt?: string
  createdAtPrison?: string
  createdBy?: string
  createdByDisplayName?: string
  updatedAt?: string
  updatedAtPrison?: string
  updatedBy?: string
  updatedByDisplayName?: string
}): GetEmployabilitySkillsResponse => ({
  employabilitySkillType: options?.employabilitySkillType || 'TEAMWORK',
  employabilitySkillRating: options?.employabilitySkillRating || 'QUITE_CONFIDENT',
  evidence: options?.evidence === null ? null : options?.evidence || 'Demonstrated in class',
  sessionType: options?.sessionType === null ? null : options?.sessionType || 'EDUCATION_REVIEW',
  sessionTypeDescription:
    options?.sessionTypeDescription === null ? null : options?.sessionTypeDescription || 'Maths class',
  createdBy: options?.createdBy || 'asmith_gen',
  createdByDisplayName: options?.createdByDisplayName || 'Alex Smith',
  createdAt: options?.createdAt || '2023-01-16T09:14:43.158Z',
  createdAtPrison: options?.createdAtPrison || 'MDI',
  updatedBy: options?.updatedBy || 'asmith_gen',
  updatedByDisplayName: options?.updatedByDisplayName || 'Alex Smith',
  updatedAt: options?.updatedAt || '2023-09-23T14:43:02.094Z',
  updatedAtPrison: options?.updatedAtPrison || 'MDI',
})

export default aValidGetEmployabilitySkillsResponse
