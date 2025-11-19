import LearnerEmployabilitySkills from './LearnerEmployabilitySkills'
import LearnerProfile from './LearnerProfile'
import { LearnerEductionPagedResponse } from './LearnerEducation'
import { LearnerLatestAssessment } from './LearnerLatestAssessment'
import LearnerGoals from './LearnerGoals'
import LearnerNeurodivergence from './LearnerNeurodivergence'

export default interface CuriousApiClient {
  getLearnerEmployabilitySkills(prisonerNumber: string): Promise<LearnerEmployabilitySkills | null>
  getLearnerProfile(prisonerNumber: string): Promise<LearnerProfile[] | null>
  getLearnerEducationPage(prisonerNumber: string, page?: number): Promise<LearnerEductionPagedResponse | null>
  getLearnerLatestAssessments(prisonerNumber: string): Promise<LearnerLatestAssessment[] | null>
  getLearnerGoals(prisonerNumber: string): Promise<LearnerGoals | null>
  getLearnerNeurodivergence(prisonerNumber: string): Promise<LearnerNeurodivergence[] | null>
}
