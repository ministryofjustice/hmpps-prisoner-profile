import LearnerEmployabilitySkills from './LearnerEmployabilitySkills'
import LearnerProfile from './LearnerProfile'
import LearnerEducation from './LearnerEducation'
import LearnerLatestAssessment from './LearnerLatestAssessment'
import LearnerGoals from './LearnerGoals'
import LearnerNeurodivergence from './LearnerNeurodivergence'

export default interface CuriousApiClient {
  getLearnerEmployabilitySkills(prisonerNumber: string): Promise<LearnerEmployabilitySkills>
  getLearnerProfile(prisonerNumber: string): Promise<LearnerProfile[]>
  getLearnerEducation(prisonerNumber: string): Promise<LearnerEducation>
  getLearnerLatestAssessments(prisonerNumber: string): Promise<LearnerLatestAssessment[]>
  getLearnerGoals(prisonerNumber: string): Promise<LearnerGoals>
  getLearnerNeurodivergence(prisonerNumber: string): Promise<LearnerNeurodivergence[]>
}
