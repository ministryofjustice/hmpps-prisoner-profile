/**
 * Interfaces defining Curious/VC2 view model types.
 *
 * These types are a deliberate abstraction from the implementation detail of the REST API that returns the data
 * so as not to tightly couple the view concerns, including the controller, to any given REST API.
 */

/**
 * A prisoner's record of In-Prison courses, which is made up of collections of [InPrisonCourse].
 */
export interface InPrisonCourseRecords {
  problemRetrievingData: boolean
  totalRecords: number
  coursesByStatus: Record<'COMPLETED' | 'IN_PROGRESS' | 'WITHDRAWN' | 'TEMPORARILY_WITHDRAWN', Array<InPrisonCourse>>
  coursesCompletedInLast12Months: Array<InPrisonCourse>
  prisonNumber: string
}

/**
 * An 'In-Prison' course record.
 */
export interface InPrisonCourse {
  prisonId: string
  prisonName: string
  courseName: string
  courseCode: string
  courseStartDate: Date
  courseStatus: 'COMPLETED' | 'IN_PROGRESS' | 'WITHDRAWN' | 'TEMPORARILY_WITHDRAWN'
  courseCompletionDate?: Date
  coursePlannedEndDate?: Date
  isAccredited: boolean
  grade?: string
  withdrawalReason?: string
  source: 'CURIOUS'
}
