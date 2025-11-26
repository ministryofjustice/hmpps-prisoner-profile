/**
 * Functions that map Curious 2 assessment DTOs from the Curious APIs to instances of Assessment
 *
 * Curious assessments that are stored in Curious 2 cover Functional Skills assessments (English, Digital and Maths),
 * Reading assessments, ESOL assessments, and ALN assessments.
 *
 * The functions exported here map specific types of assessment.
 */

import { startOfDay } from 'date-fns'
import type {
  ExternalAssessmentsDTO,
  LearnerAssessmentsDTO,
  LearnerAssessmentsFunctionalSkillsDTO,
} from 'curiousApiClient'
import { Assessment } from '../interfaces/curiousService/CuriousFunctionalSkillsAssessments'

/**
 * Maps the Functional Skills LearnerAssessmentsFunctionalSkillsDTO (specifically those of type English, Maths and Digital) from the ExternalAssessmentsDTO into an array of Assessment
 */
const toCurious2FunctionalSkillsAssessments = (externalAssessmentsDTO: ExternalAssessmentsDTO): Array<Assessment> =>
  [] //
    .concat(
      (externalAssessmentsDTO?.englishFunctionalSkills || []).map(
        (assessment: LearnerAssessmentsFunctionalSkillsDTO) => ({
          ...toBasicAssessment(assessment),
          level: assessment.workingTowardsLevel,
          levelBanding: getLevelBandingFromAssessment(assessment),
          type: 'ENGLISH',
        }),
      ),
    )
    .concat(
      (externalAssessmentsDTO?.mathsFunctionalSkills || []).map(
        (assessment: LearnerAssessmentsFunctionalSkillsDTO) => ({
          ...toBasicAssessment(assessment),
          level: assessment.workingTowardsLevel,
          levelBanding: getLevelBandingFromAssessment(assessment),
          type: 'MATHS',
        }),
      ),
    )
    .concat(
      (externalAssessmentsDTO?.digitalSkillsFunctionalSkills || []).map(
        (assessment: LearnerAssessmentsFunctionalSkillsDTO) => ({
          ...toBasicAssessment(assessment),
          level: assessment.workingTowardsLevel,
          levelBanding: getLevelBandingFromAssessment(assessment),
          type: 'DIGITAL_LITERACY',
        }),
      ),
    )

/**
 * Maps the LearnerAssessmentsDTOs of type Reading from the ExternalAssessmentsDTO into an array of Assessment
 */
const toCurious2ReadingAssessments = (externalAssessmentsDTO: ExternalAssessmentsDTO): Array<Assessment> =>
  (externalAssessmentsDTO?.reading || []).map((assessment: LearnerAssessmentsDTO) => ({
    ...toBasicAssessment(assessment),
    level: assessment.assessmentOutcome,
    levelBanding: null as string,
    type: 'READING',
  }))

/**
 * Maps the LearnerAssessmentsDTOs of type ESOL from the ExternalAssessmentsDTO into an array of Assessment
 */
const toCurious2ESOLAssessments = (externalAssessmentsDTO: ExternalAssessmentsDTO): Array<Assessment> =>
  (externalAssessmentsDTO?.esol || []).map((assessment: LearnerAssessmentsDTO) => ({
    ...toBasicAssessment(assessment),
    level: assessment.assessmentOutcome,
    levelBanding: null as string,
    type: 'ESOL',
  }))

const toBasicAssessment = (assessment: LearnerAssessmentsFunctionalSkillsDTO | LearnerAssessmentsDTO): Assessment =>
  ({
    prisonId: assessment.establishmentId,
    assessmentDate: startOfDay(assessment.assessmentDate),
    referral: assessment.stakeholderReferral
      ? (assessment.stakeholderReferral as string).split(',').map(referral => referral.trim())
      : null,
    nextStep: assessment.assessmentNextStep,
    source: 'CURIOUS2',
  }) as Assessment

/*
 Temporary method to smooth over a Curious API change where they are in the process or rolling out a field name change.
 The original (incorrect) field name was levelBranding, but it should have been levelBanding
 Whilst they roll out this change in all their environments we need this method to defensively code around it.
 */
const getLevelBandingFromAssessment = (assessment: { levelBanding?: string; levelBranding?: string }): string =>
  assessment.levelBanding || assessment.levelBranding

export { toCurious2FunctionalSkillsAssessments, toCurious2ReadingAssessments, toCurious2ESOLAssessments }
