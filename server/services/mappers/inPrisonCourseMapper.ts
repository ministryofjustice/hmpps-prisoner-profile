import { parseISO, startOfDay } from 'date-fns'
import type { LearnerEducationDTO, LearnerQualificationsDTO } from 'curiousApiClient'
import { LearnerEducation } from '../../data/interfaces/curiousApi/LearnerEducation'
import { InPrisonCourse } from '../interfaces/curiousService/CuriousInPrisonCourses'

/**
 * @deprecated This mapper method maps from the Curious 1 data type and will be replaced by calls to toInPrisonCourseFromLearnerEducationDTO
 * TODO - remove this mapper method
 */
const toInPrisonCourse = (apiLearnerEducation: LearnerEducation): InPrisonCourse => {
  return {
    prisonId: apiLearnerEducation.establishmentId,
    prisonName: apiLearnerEducation.establishmentName,
    courseCode: apiLearnerEducation.courseCode,
    courseName: apiLearnerEducation.courseName,
    courseStartDate: startOfDay(parseISO(apiLearnerEducation.learningStartDate)),
    courseStatus: toCourseStatus(apiLearnerEducation.completionStatus),
    courseCompletionDate: apiLearnerEducation.learningActualEndDate
      ? startOfDay(parseISO(apiLearnerEducation.learningActualEndDate))
      : null,
    coursePlannedEndDate: apiLearnerEducation.learningPlannedEndDate
      ? startOfDay(parseISO(apiLearnerEducation.learningPlannedEndDate))
      : null,
    isAccredited: apiLearnerEducation.isAccredited,
    grade: apiLearnerEducation.outcomeGrade || apiLearnerEducation.outcome || null,
    withdrawalReason: apiLearnerEducation.prisonWithdrawalReason,
    source: 'CURIOUS',
  }
}

const toInPrisonCourseFromLearnerEducationDTO = (apiLearnerEducation: LearnerEducationDTO): InPrisonCourse => ({
  prisonId: apiLearnerEducation.establishmentId,
  prisonName: null, // TODO - remove
  courseCode: apiLearnerEducation.courseCode,
  courseName: apiLearnerEducation.courseName,
  courseStartDate: startOfDay(parseISO(apiLearnerEducation.learningStartDate)),
  courseStatus: toCourseStatus(apiLearnerEducation.completionStatus),
  courseCompletionDate: apiLearnerEducation.learningActualEndDate
    ? startOfDay(parseISO(apiLearnerEducation.learningActualEndDate))
    : null,
  coursePlannedEndDate: apiLearnerEducation.learningPlannedEndDate
    ? startOfDay(parseISO(apiLearnerEducation.learningPlannedEndDate))
    : null,
  isAccredited: apiLearnerEducation.isAccredited,
  grade: apiLearnerEducation.outcomeGrade || apiLearnerEducation.outcome || null,
  withdrawalReason: apiLearnerEducation.prisonWithdrawalReason,
  source: 'CURIOUS1',
})

const toInPrisonCourseFromLearnerQualificationsDTO = (
  apiLearnerQualification: LearnerQualificationsDTO,
): InPrisonCourse => ({
  prisonId: apiLearnerQualification.establishmentId,
  prisonName: null, // TODO - remove
  courseCode: apiLearnerQualification.qualificationCode,
  courseName: apiLearnerQualification.qualificationName,
  courseStartDate: startOfDay(parseISO(apiLearnerQualification.learningStartDate)),
  courseStatus: toCourseStatus(apiLearnerQualification.completionStatus),
  courseCompletionDate: apiLearnerQualification.learningActualEndDate
    ? startOfDay(parseISO(apiLearnerQualification.learningActualEndDate))
    : null,
  coursePlannedEndDate: apiLearnerQualification.learningPlannedEndDate
    ? startOfDay(parseISO(apiLearnerQualification.learningPlannedEndDate))
    : null,
  isAccredited: apiLearnerQualification.isAccredited,
  grade: apiLearnerQualification.outcomeGrade || apiLearnerQualification.outcome || null,
  withdrawalReason: apiLearnerQualification.withdrawalReason,
  source: 'CURIOUS2',
})

/**
 * Returns one of 'COMPLETED' | 'IN_PROGRESS' | 'WITHDRAWN' | 'TEMPORARILY_WITHDRAWN' to represent the course status.
 * Logic is based on the field `completionStatus` in the Curious API response object which (contrary to the swagger spec)
 * has one of four fixed values. The values look like free text field, but are actually the screen labels for the Curious
 * drop down field.
 *
 * The four possible values are:
 *   * `The learner is continuing or intending to continue the learning activities leading to the learning aim` = IN_PROGRESS
 *   * `The learner has completed the learning activities leading to the learning aim`                          = COMPLETED
 *   * `The learner has withdrawn from the learning activities leading to the learning aim`                     = WITHDRAWN
 *   * `Learner has temporarily withdrawn from the aim due to an agreed break in learning`                      = TEMPORARILY_WITHDRAWN
 *
 * The matching logic is based on matching relevant words in the screen label in order to not make this function too
 * brittle and allow for the Curious screen labels to change slightly without breaking this logic.
 * There is no known process for communication in changes of the Curious screen labels to dependant services such as
 * this, so there is a risk that this logic could break in the future, though the use of matching on relevant words
 * rather than the whole string should minimise this as far as practical.
 */
const toCourseStatus = (
  completionStatus: string,
): 'COMPLETED' | 'IN_PROGRESS' | 'WITHDRAWN' | 'TEMPORARILY_WITHDRAWN' => {
  const statusScreenLabel = completionStatus.toUpperCase()
  if (statusScreenLabel.includes('WITHDRAWN')) {
    if (statusScreenLabel.includes('TEMPORARILY')) {
      return 'TEMPORARILY_WITHDRAWN'
    }
    return 'WITHDRAWN'
  }

  if (statusScreenLabel.includes('COMPLETED')) {
    return 'COMPLETED'
  }

  return 'IN_PROGRESS'
}

export {
  toInPrisonCourse,
  toInPrisonCourseFromLearnerEducationDTO,
  toInPrisonCourseFromLearnerQualificationsDTO,
  toCourseStatus,
}
