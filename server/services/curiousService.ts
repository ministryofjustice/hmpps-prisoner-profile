import { startOfDay, startOfToday, subMonths } from 'date-fns'
import CuriousApiClient from '../data/interfaces/curiousApi/curiousApiClient'
import logger from '../../logger'
import PrisonService from './prisonService'
import { InPrisonCourse, InPrisonCourseRecords } from './interfaces/curiousService/CuriousInPrisonCourses'
import { LearnerEducation, LearnerEductionPagedResponse } from '../data/interfaces/curiousApi/LearnerEducation'
import { toInPrisonCourse } from './mappers/inPrisonCourseMapper'
import dateComparator from '../utils/dateComparator'
import { CuriousRestClientBuilder } from '../data'
import { CuriousApiToken } from '../data/hmppsAuthClient'

export default class CuriousService {
  constructor(
    private readonly curiousApiClientBuilder: CuriousRestClientBuilder<CuriousApiClient>,
    private readonly prisonService: PrisonService,
    private readonly curiousApiTokenBuilder: () => Promise<CuriousApiToken>,
  ) {}

  /**
   * Returns the specified prisoner's In Prison Course Records
   *
   * The Curious `learnerEducation` API is a paged API. This function calls the API starting from page 0 until there are no
   * more pages remaining. The cumulative array of Curious `LearnerEducation` records from all API calls are mapped and
   * grouped into arrays of `InPrisonCourse` within the returned `InPrisonCourseRecords` object.
   */
  async getPrisonerInPrisonCourses(prisonNumber: string, token: string): Promise<InPrisonCourseRecords> {
    try {
      let page = 0
      let apiPagedResponse = { last: false } as LearnerEductionPagedResponse
      const apiLearnerEducation: Array<LearnerEducation> = []
      const curiousApiToken = await this.curiousApiTokenBuilder()

      // loop until the API response's `last` field is `true`
      while (apiPagedResponse.last === false) {
        // eslint-disable-next-line no-await-in-loop
        apiPagedResponse = await this.curiousApiClientBuilder(curiousApiToken).getLearnerEducationPage(
          prisonNumber,
          page,
        )
        if (!apiPagedResponse) {
          return this.noLearnerEducationForPrisoner(prisonNumber)
        }
        apiLearnerEducation.push(...apiPagedResponse.content)
        page += 1
      }

      const allCoursesWithPrisonNamePopulated = await this.allCoursesWithPrisonNamePopulated(apiLearnerEducation, token)
      const totalRecords = allCoursesWithPrisonNamePopulated.length

      const completedCourses = coursesFilteredByStatus(allCoursesWithPrisonNamePopulated, 'COMPLETED')
      const inProgressCourses = coursesFilteredByStatus(allCoursesWithPrisonNamePopulated, 'IN_PROGRESS')
      const withdrawnCourses = coursesFilteredByStatus(allCoursesWithPrisonNamePopulated, 'WITHDRAWN')
      const temporarilyWithdrawnCourses = coursesFilteredByStatus(
        allCoursesWithPrisonNamePopulated,
        'TEMPORARILY_WITHDRAWN',
      )

      const coursesCompletedInLast12Months = [...completedCourses].filter(inPrisonCourse => {
        const twelveMonthsAgo = startOfDay(subMonths(startOfToday(), 12))
        return inPrisonCourse.courseCompletionDate >= twelveMonthsAgo
      })

      return {
        problemRetrievingData: false,
        totalRecords,
        coursesByStatus: {
          COMPLETED: completedCourses,
          IN_PROGRESS: inProgressCourses,
          WITHDRAWN: withdrawnCourses,
          TEMPORARILY_WITHDRAWN: temporarilyWithdrawnCourses,
        },
        coursesCompletedInLast12Months,
        prisonNumber,
      }
    } catch (error) {
      logger.error('Error retrieving learner education data from Curious', error)
      return { problemRetrievingData: true } as InPrisonCourseRecords
    }
  }

  private async allCoursesWithPrisonNamePopulated(
    apiLearnerEducation: Array<LearnerEducation>,
    token: string,
  ): Promise<InPrisonCourse[]> {
    const allCourses = apiLearnerEducation
      .map(learnerEducation => toInPrisonCourse(learnerEducation))
      .sort((left: InPrisonCourse, right: InPrisonCourse) =>
        dateComparator(left.courseCompletionDate, right.courseCompletionDate, 'DESC'),
      )
    return this.setPrisonNamesOnInPrisonCourses(allCourses, token)
  }

  private async setPrisonNamesOnInPrisonCourses(
    inPrisonCourses: Array<InPrisonCourse>,
    token: string,
  ): Promise<Array<InPrisonCourse>> {
    return Promise.all(
      inPrisonCourses.map(async inPrisonCourse => {
        const prison = await this.prisonService.getPrisonByPrisonId(inPrisonCourse.prisonId, token)
        return {
          ...inPrisonCourse,
          prisonName: prison.prisonName || inPrisonCourse.prisonName,
        }
      }),
    )
  }

  private noLearnerEducationForPrisoner(prisonNumber: string): InPrisonCourseRecords {
    logger.info(`No learner education data found for prisoner [${prisonNumber}] in Curious`)
    return {
      problemRetrievingData: false,
      totalRecords: 0,
      coursesByStatus: {
        COMPLETED: [],
        IN_PROGRESS: [],
        WITHDRAWN: [],
        TEMPORARILY_WITHDRAWN: [],
      },
      coursesCompletedInLast12Months: [],
      prisonNumber,
    }
  }
}

const coursesFilteredByStatus = (
  courses: InPrisonCourse[],
  status: 'COMPLETED' | 'IN_PROGRESS' | 'WITHDRAWN' | 'TEMPORARILY_WITHDRAWN',
): InPrisonCourse[] => [...courses.filter(course => course.courseStatus === status)]
