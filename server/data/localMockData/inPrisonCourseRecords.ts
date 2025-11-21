import { InPrisonCourseRecords } from '../../services/interfaces/curiousService/CuriousInPrisonCourses'
import { aValidEnglishInPrisonCourse, aValidMathsInPrisonCourse } from './inPrisonCourse'

const aPopulatedInPrisonCourseRecords = (prisonNumber = 'A1234'): InPrisonCourseRecords => ({
  problemRetrievingData: false,
  prisonNumber,
  totalRecords: 2,
  coursesByStatus: {
    COMPLETED: [aValidMathsInPrisonCourse()],
    IN_PROGRESS: [aValidEnglishInPrisonCourse()],
    WITHDRAWN: [],
    TEMPORARILY_WITHDRAWN: [],
  },
  coursesCompletedInLast12Months: [],
  hasWithdrawnOrInProgressCourses: jest.fn(),
  hasCoursesCompletedMoreThan12MonthsAgo: jest.fn(),
})

const anEmptyInPrisonCourseRecords = (prisonNumber = 'A1234'): InPrisonCourseRecords => ({
  problemRetrievingData: false,
  prisonNumber,
  totalRecords: 0,
  coursesByStatus: {
    COMPLETED: [],
    IN_PROGRESS: [],
    WITHDRAWN: [],
    TEMPORARILY_WITHDRAWN: [],
  },
  coursesCompletedInLast12Months: [],
  hasWithdrawnOrInProgressCourses: jest.fn(),
  hasCoursesCompletedMoreThan12MonthsAgo: jest.fn(),
})

const aFailureInPrisonCourseRecords = (prisonNumber = 'A1234'): InPrisonCourseRecords =>
  ({ problemRetrievingData: true, prisonNumber }) as InPrisonCourseRecords

export { aPopulatedInPrisonCourseRecords, anEmptyInPrisonCourseRecords, aFailureInPrisonCourseRecords }
