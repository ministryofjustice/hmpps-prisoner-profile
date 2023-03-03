import { LearnerEducation } from '../../interfaces/learnerEducation'
import { LearnerEmployabilitySkills } from '../../interfaces/learnerEmployabilitySkills'
import { LearnerGoals } from '../../interfaces/learnerGoals'
import { LearnerLatestAssessment } from '../../interfaces/learnerLatestAssessments'
import { LearnerNeurodivergence } from '../../interfaces/learnerNeurodivergence'
import { LearnerProfile } from '../../interfaces/learnerProfile'

export default interface CuriousApiClient {
  getLearnerEmployabilitySkills(prisonerNumber: string): Promise<LearnerEmployabilitySkills>
  getLearnerProfile(prisonerNumber: string): Promise<LearnerProfile[]>
  getLearnerEducation(prisonerNumber: string): Promise<LearnerEducation[]>
  getLearnerLatestAssessments(prisonerNumber: string): Promise<LearnerLatestAssessment[]>
  getLearnerGoals(prisonerNumber: string): Promise<LearnerGoals>
  getLearnerNeurodivergence(prisonerNumber: string): Promise<LearnerNeurodivergence[]>
}
