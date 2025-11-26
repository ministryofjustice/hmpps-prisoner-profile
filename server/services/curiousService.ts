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
import config from '../config'
import toInPrisonCourseRecords from './mappers/inPrisonCourseRecordsMapper'
import { FunctionalSkills } from './interfaces/curiousService/CuriousFunctionalSkillsAssessments'
import toFunctionalSkills from './mappers/functionalSkillsMapper'

export default class CuriousService {
  constructor(
    private readonly curiousApiClientBuilder: CuriousRestClientBuilder<CuriousApiClient>,
    private readonly prisonService: PrisonService,
    private readonly curiousApiTokenBuilder: () => Promise<CuriousApiToken>,
  ) {}

  /**
   * Returns the specified prisoner's In Prison Course Records
   */
  async getPrisonerInPrisonCourses(prisonNumber: string, token: string): Promise<InPrisonCourseRecords> {
    const curiousApiToken = await this.curiousApiTokenBuilder()

    if (config.featureToggles.useCurious2Api) {
      try {
        const allPrisonerQualifications =
          await this.curiousApiClientBuilder(curiousApiToken).getLearnerQualifications(prisonNumber)
        return toInPrisonCourseRecords(allPrisonerQualifications)
      } catch (error) {
        logger.error('Error retrieving learner education data from Curious', error)
        throw error
      }
    }

    /*
      @deprecated - the following is the old behaviour/approach of getting In Prison Qualifications
      It retrieves Curious 1 only courses, from the Curious 1 endpoint

      The Curious `learnerEducation` API is a paged API. This function calls the API starting from page 0 until there are no
      more pages remaining. The cumulative array of Curious `LearnerEducation` records from all API calls are mapped and
      grouped into arrays of `InPrisonCourse` within the returned `InPrisonCourseRecords` object.

      TODO - remove this code and all supporting code/functions when In Prison Courses are retrieved from the Curious 2
      endpoint via the useCurious2Api feature toggle.
     */
    try {
      let page = 0
      let apiPagedResponse = { last: false } as LearnerEductionPagedResponse
      const apiLearnerEducation: Array<LearnerEducation> = []

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
        hasCoursesCompletedMoreThan12MonthsAgo: null,
        hasWithdrawnOrInProgressCourses: null,
      }
    } catch (error) {
      logger.error('Error retrieving learner education data from Curious', error)
      return { problemRetrievingData: true } as InPrisonCourseRecords
    }
  }

  async getPrisonerFunctionalSkills(prisonNumber: string): Promise<FunctionalSkills> {
    const curiousApiToken = await this.curiousApiTokenBuilder()

    try {
      const allPrisonerAssessments =
        await this.curiousApiClientBuilder(curiousApiToken).getLearnerAssessments(prisonNumber)
      return toFunctionalSkills(allPrisonerAssessments)
    } catch (error) {
      logger.error('Error retrieving functional skills data from Curious', error)
      throw error
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
      hasCoursesCompletedMoreThan12MonthsAgo: null,
      hasWithdrawnOrInProgressCourses: null,
    }
  }
}

const coursesFilteredByStatus = (
  courses: InPrisonCourse[],
  status: 'COMPLETED' | 'IN_PROGRESS' | 'WITHDRAWN' | 'TEMPORARILY_WITHDRAWN',
): InPrisonCourse[] => [...courses.filter(course => course.courseStatus === status)]
