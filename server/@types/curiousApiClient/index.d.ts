declare module 'curiousApiClient' {
  import { components } from '../curiousApi'

  // Curious 1 data types
  export type LearnerEducationDTO = components['schemas']['LearnerEducationDTO']
  export type LearnerEducationPage = components['schemas']['LearnerEducationPage']
  export type LearnerLatestAssessmentDTO = components['schemas']['LearnerLatestAssessmentDTO']
  export type LearnerAssessmentDTO = components['schemas']['LearnerAssessmentDTO']
  export type LearnerNeurodivergenceDTO = components['schemas']['LearnerNeurodivergenceDTO']
  export type LearnerGoalsDTO = components['schemas']['LearnerGoalsDTO']
  export type EmployabilitySkillsPage = components['schemas']['EmployabilitySkillsPage']

  // Curious 2 data types
  export type AllAssessmentDTO = components['schemas']['AllAssessmentDTO']
  export type AllQualificationsDTO = components['schemas']['AllQualificationsDTO']
}
