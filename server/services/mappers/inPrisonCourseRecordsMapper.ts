import { startOfToday, sub } from 'date-fns'
import type { AllQualificationsDTO, LearnerEducationDTO, LearnerQualificationsDTO } from 'curiousApiClient'
import { InPrisonCourseRecords } from '../interfaces/curiousService/CuriousInPrisonCourses'
import {
  toInPrisonCourseFromLearnerEducationDTO,
  toInPrisonCourseFromLearnerQualificationsDTO,
} from './inPrisonCourseMapper'

const toInPrisonCourseRecords = (allPrisonerQualifications: AllQualificationsDTO): InPrisonCourseRecords => {
  const curiousV1Courses = (allPrisonerQualifications?.v1 || []) as Array<LearnerEducationDTO>
  const curiousV2Courses = (allPrisonerQualifications?.v2 || []) as Array<LearnerQualificationsDTO>
  const allCourses = curiousV1Courses
    .map(toInPrisonCourseFromLearnerEducationDTO)
    .concat(curiousV2Courses.map(toInPrisonCourseFromLearnerQualificationsDTO))

  const completedCourses = [...allCourses].filter(inPrisonCourse => inPrisonCourse.courseStatus === 'COMPLETED')
  const inProgressCourses = [...allCourses].filter(inPrisonCourse => inPrisonCourse.courseStatus === 'IN_PROGRESS')
  const withdrawnCourses = [...allCourses].filter(inPrisonCourse => inPrisonCourse.courseStatus === 'WITHDRAWN')
  const temporarilyWithdrawnCourses = [...allCourses].filter(
    inPrisonCourse => inPrisonCourse.courseStatus === 'TEMPORARILY_WITHDRAWN',
  )

  const twelveMonthsAgo = sub(startOfToday(), { months: 12 })
  const coursesCompletedInLast12Months = [...completedCourses].filter(
    inPrisonCourse => inPrisonCourse.courseCompletionDate >= twelveMonthsAgo,
  )

  return {
    totalRecords: allCourses.length,
    coursesByStatus: {
      COMPLETED: completedCourses,
      IN_PROGRESS: inProgressCourses,
      WITHDRAWN: withdrawnCourses,
      TEMPORARILY_WITHDRAWN: temporarilyWithdrawnCourses,
    },
    coursesCompletedInLast12Months,
    hasCoursesCompletedMoreThan12MonthsAgo: () =>
      completedCourses.some(inPrisonCourse => inPrisonCourse.courseCompletionDate < twelveMonthsAgo),
    hasWithdrawnOrInProgressCourses: () =>
      withdrawnCourses.length + temporarilyWithdrawnCourses.length + inProgressCourses.length > 0,
    prisonNumber: null,
    problemRetrievingData: null,
  }
}

export default toInPrisonCourseRecords
