import { Request, Response } from 'express'
import retrieveCuriousInPrisonCourses from './retrieveCuriousInPrisonCourses'
import { InPrisonCourseRecords } from '../services/interfaces/curiousService/CuriousInPrisonCourses'
import {
  aValidEnglishInPrisonCourse,
  aValidEnglishInPrisonCourseCompletedWithinLast12Months,
  aValidMathsInPrisonCourse,
} from '../data/localMockData/inPrisonCourse'
import CuriousService from '../services/curiousService'

jest.mock('../services/curiousService')

describe('retrieveCuriousInPrisonCourses', () => {
  let req: Request
  let res: Response
  const next = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
    req = {
      params: {},
    } as unknown as Request
    res = {
      locals: {},
    } as unknown as Response
  })

  const curiousService = new CuriousService(null, null) as jest.Mocked<CuriousService>
  const requestHandler = retrieveCuriousInPrisonCourses(curiousService)

  describe('Courses retrieved from Curious 2 endpoint', () => {
    it('should retrieve prisoner In Prison Courses', async () => {
      // Given
      const prisonerNumber = 'A1234GC'
      req.params.prisonerNumber = prisonerNumber

      const expectedInPrisonCourses: InPrisonCourseRecords = {
        totalRecords: 3,
        coursesByStatus: {
          COMPLETED: [aValidMathsInPrisonCourse(), aValidEnglishInPrisonCourseCompletedWithinLast12Months()],
          IN_PROGRESS: [aValidEnglishInPrisonCourse()],
          WITHDRAWN: [],
          TEMPORARILY_WITHDRAWN: [],
        },
        coursesCompletedInLast12Months: [aValidEnglishInPrisonCourseCompletedWithinLast12Months()],
        hasWithdrawnOrInProgressCourses: jest.fn(),
        hasCoursesCompletedMoreThan12MonthsAgo: jest.fn(),
        problemRetrievingData: null,
        prisonNumber: null,
      }
      curiousService.getPrisonerInPrisonCourses.mockResolvedValue(expectedInPrisonCourses)

      // When
      await requestHandler(req, res, next)

      // Then
      expect(res.locals.inPrisonCourses.isFulfilled()).toEqual(true)
      expect(res.locals.inPrisonCourses.value).toEqual(expectedInPrisonCourses)
      expect(curiousService.getPrisonerInPrisonCourses).toHaveBeenCalledWith(prisonerNumber)
      expect(next).toHaveBeenCalled()
    })
  })
})
