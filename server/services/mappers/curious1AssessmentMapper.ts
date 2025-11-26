/**
 * Functions that map Curious 1 assessment DTOs from the Curious APIs to instances of Assessment
 *
 * Curious assessments that are stored in Curious 1 are Functional Skills assessments, and are assessments of English,
 * Maths and Digital skills.
 *
 * Curious assessments that are stored in Curious 1 are returned by the API:
 *  - /learnerAssessments/v2 which returns an instance of AllAssessmentDTO which in turn contains an array of LearnerAssessmentV1DTO
 *      This is colloquially known as the Curious 2 API, though a better name would be the v2 API, as the API itself is not coupled to
 *      a version of Curious, and in this context is returning data from both Curious 1 and Curious 2
 */

import { startOfDay } from 'date-fns'
import type { LearnerAssessmentV1DTO, LearnerLatestAssessmentV1DTO } from 'curiousApiClient'
import { Assessment } from '../interfaces/curiousService/CuriousFunctionalSkillsAssessments'

/**
 * Map the Curious 1 assessments to an array of Assessment
 */
const toCurious1AssessmentsFromAllAssessmentDTO = (
  curiousV1Assessments: Array<LearnerLatestAssessmentV1DTO>,
): Array<Assessment> =>
  (curiousV1Assessments || [])
    .flatMap((assessment: LearnerLatestAssessmentV1DTO) => assessment.qualifications || [])
    .filter((v1LearnerAssessment: LearnerAssessmentV1DTO) => v1LearnerAssessment.qualification != null)
    .map(toAssessmentFromLearnerAssessmentV1DTO)

/**
 * Maps a single Curious 1 assessment LearnerAssessmentV1DTO into an Assessment
 */
const toAssessmentFromLearnerAssessmentV1DTO = (v1LearnerAssessment: LearnerAssessmentV1DTO): Assessment => ({
  prisonId: v1LearnerAssessment.establishmentId,
  type: toAssessmentType(v1LearnerAssessment.qualification.qualificationType),
  assessmentDate: startOfDay(v1LearnerAssessment.qualification.assessmentDate),
  level: v1LearnerAssessment.qualification.qualificationGrade,
  levelBanding: null,
  referral: null,
  nextStep: null,
  source: 'CURIOUS1',
})

const toAssessmentType = (qualificationType: string): 'ENGLISH' | 'MATHS' | 'DIGITAL_LITERACY' => {
  switch (qualificationType) {
    case 'English': {
      return 'ENGLISH'
    }
    case 'Maths': {
      return 'MATHS'
    }
    case 'Digital Literacy': {
      return 'DIGITAL_LITERACY'
    }
    default: {
      return undefined
    }
  }
}

export default toCurious1AssessmentsFromAllAssessmentDTO
