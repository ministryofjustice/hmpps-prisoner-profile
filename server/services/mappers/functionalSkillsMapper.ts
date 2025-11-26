import type { AllAssessmentDTO, ExternalAssessmentsDTO, LearnerLatestAssessmentV1DTO } from 'curiousApiClient'
import toCurious1AssessmentsFromAllAssessmentDTO from './curious1AssessmentMapper'
import {
  toCurious2ESOLAssessments,
  toCurious2FunctionalSkillsAssessments,
  toCurious2ReadingAssessments,
} from './curious2AssessmentMapper'
import { FunctionalSkills } from '../interfaces/curiousService/CuriousFunctionalSkillsAssessments'

/**
 * Map to FunctionalSkills
 * @param allAssessments is an instance of AllAssessmentDTO from the Curious 2 /learnerAssessments/v2 endpoint. This contains the
 * prisoner's Functional Skills Assessments from Curious 2, plus **the latest of type** assessments as recorded in Curious 1.
 * It does not contain all Functional Skills Assessments recorded in Curious 1
 *
 */
const toFunctionalSkills = (allAssessments: AllAssessmentDTO): FunctionalSkills => {
  const assessmentsRecordedInCurious1: Array<LearnerLatestAssessmentV1DTO> = allAssessments?.v1 || []
  const assessmentsRecordedInCurious2: ExternalAssessmentsDTO = allAssessments?.v2?.assessments || {}
  return {
    assessments: [].concat(
      ...toCurious2FunctionalSkillsAssessments(assessmentsRecordedInCurious2),
      ...toCurious2ReadingAssessments(assessmentsRecordedInCurious2),
      ...toCurious2ESOLAssessments(assessmentsRecordedInCurious2),
      ...toCurious1AssessmentsFromAllAssessmentDTO(assessmentsRecordedInCurious1),
    ),
  }
}

export default toFunctionalSkills
