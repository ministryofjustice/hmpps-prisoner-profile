import { LearnerEmployabilitySkills } from '../../interfaces/learnerEmployabilitySkills'

export default interface CuriousApiClient {
  getLearnerEmployabilitySkills(prisonerNunmber: string): Promise<LearnerEmployabilitySkills>
}
