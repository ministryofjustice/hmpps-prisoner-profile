import { LearnerEmployabilitySkills } from '../../interfaces/learnerEmployabilitySkills'
import { LearnerProfile } from '../../interfaces/learnerProfile'

export default interface CuriousApiClient {
  getLearnerEmployabilitySkills(prisonerNunmber: string): Promise<LearnerEmployabilitySkills>
  getLearnerProfile(prisonerNunmber: string): Promise<LearnerProfile[]>
}
