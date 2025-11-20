import type { AllAssessmentDTO, AllQualificationsDTO } from 'curiousApiClient'
import LearnerEmployabilitySkills from './LearnerEmployabilitySkills'
import { LearnerEductionPagedResponse } from './LearnerEducation'
import { LearnerLatestAssessment } from './LearnerLatestAssessment'
import LearnerGoals from './LearnerGoals'
import LearnerNeurodivergence from './LearnerNeurodivergence'

export default interface CuriousApiClient {
  // Curious 1 endpoints
  getLearnerEmployabilitySkills(prisonerNumber: string): Promise<LearnerEmployabilitySkills | null>
  getLearnerGoals(prisonerNumber: string): Promise<LearnerGoals | null>
  getLearnerNeurodivergence(prisonerNumber: string): Promise<LearnerNeurodivergence[] | null>

  /**
   * @deprecated - this method calls a Curious 1 endpoint. Use a method that calls a suitable Curious 2 endpoint instead
   */
  getLearnerEducationPage(prisonerNumber: string, page?: number): Promise<LearnerEductionPagedResponse | null>

  /**
   * @deprecated - this method calls a Curious 1 endpoint. Use a method that calls a suitable Curious 2 endpoint instead
   */
  getLearnerLatestAssessments(prisonerNumber: string): Promise<LearnerLatestAssessment[] | null>

  // Curious 2 endpoints

  /**
   * Calls the Curious V2 endpoint to get all assessments for a given prisoner
   * The returned data includes LDD and Functional Skills data as recorded in Curious 1, and all assessments (ALN,
   * Functional Skills (Maths, English and Digital Skills), ESOL and Reading) as recorded in Curious 2.
   *
   * @param prisonerNumber
   * @return AllAssessmentDTO
   */
  getLearnerAssessments(prisonerNumber: string): Promise<AllAssessmentDTO>

  /**
   * Calls the Curious V2 endpoint to get all In-Prison courses & qualifications for a given prisoner
   * The returned data includes courses and qualifications as recorded in both Curious 1 and Curious 2.
   *
   * @param prisonerNumber
   * @return AllQualificationsDTO
   */
  getLearnerQualifications(prisonerNumber: string): Promise<AllQualificationsDTO>
}
