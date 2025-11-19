declare module 'curiousApiClient' {
  import { components } from '../curiousApi'

  export type LearnerEducationDTO = components['schemas']['LearnerEducationDTO']
  export type LearnerEducationPage = components['schemas']['LearnerEducationPage']
  export type LearnerLatestAssessmentDTO = components['schemas']['LearnerLatestAssessmentDTO']
  export type LearnerAssessmentDTO = components['schemas']['LearnerAssessmentDTO']
  export type LearnerProfileDTO = components['schemas']['LearnerProfileDTO']
  export type LearnerNeurodivergenceDTO = components['schemas']['LearnerNeurodivergenceDTO']
  export type LearnerGoalsDTO = components['schemas']['LearnerGoalsDTO']
  export type EmployabilitySkillsPage = components['schemas']['EmployabilitySkillsPage']
}
