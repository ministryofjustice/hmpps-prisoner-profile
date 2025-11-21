import { Request, Response } from 'express'
import retrieveCuriousInPrisonCourses from './retrieveCuriousInPrisonCourses'
import { InPrisonCourseRecords } from '../services/interfaces/curiousService/CuriousInPrisonCourses'
import {
  aValidEnglishInPrisonCourse,
  aValidEnglishInPrisonCourseCompletedWithinLast12Months,
  aValidMathsInPrisonCourse,
} from '../data/localMockData/inPrisonCourse'
import CuriousService from '../services/curiousService'
import config from '../config'

jest.mock('../services/curiousService')
jest.mock('../config')

describe('retrieveCuriousInPrisonCourses', () => {
  let req: Request
  let res: Response
  const next = jest.fn()

  const token = 'a-system-token'

  beforeEach(() => {
    jest.resetAllMocks()
    req = {
      params: {},
      middleware: { clientToken: token },
    } as unknown as Request
    res = {
      locals: {},
    } as unknown as Response
  })

  const curiousService = new CuriousService(null, null, null) as jest.Mocked<CuriousService>
  const requestHandler = retrieveCuriousInPrisonCourses(curiousService)

  describe('Courses retrieved from Curious 1 endpoint', () => {
    beforeEach(() => {
      jest.replaceProperty(config.featureToggles, 'useCurious2Api', false)
    })

    it('should retrieve prisoner In Prison Courses given In Prison Courses not already on res.locals', async () => {
      // Given
      res.locals.inPrisonCourses = undefined

      const prisonerNumber = 'A1234GC'
      req.params.prisonerNumber = prisonerNumber

      const expectedInPrisonCourses: InPrisonCourseRecords = {
        problemRetrievingData: false,
        prisonNumber: prisonerNumber,
        totalRecords: 2,
        coursesByStatus: {
          COMPLETED: [aValidMathsInPrisonCourse()],
          IN_PROGRESS: [aValidEnglishInPrisonCourse()],
          WITHDRAWN: [],
          TEMPORARILY_WITHDRAWN: [],
        },
        coursesCompletedInLast12Months: [],
        hasCoursesCompletedMoreThan12MonthsAgo: null,
        hasWithdrawnOrInProgressCourses: null,
      }
      curiousService.getPrisonerInPrisonCourses.mockResolvedValue(expectedInPrisonCourses)

      // When
      await requestHandler(req, res, next)

      // Then
      expect(curiousService.getPrisonerInPrisonCourses).toHaveBeenCalledWith(prisonerNumber, token)
      expect(res.locals.inPrisonCourses).toEqual(expectedInPrisonCourses)
      expect(next).toHaveBeenCalled()
    })

    it('should retrieve prisoner In Prison Courses given In Prison Courses for a different prisoner already in res.locals', async () => {
      // Given
      res.locals.inPrisonCourses = {
        problemRetrievingData: false,
        prisonerNumber: 'Z1234XY',
        totalRecords: 2,
        coursesByStatus: {
          COMPLETED: [aValidMathsInPrisonCourse()],
          IN_PROGRESS: [aValidEnglishInPrisonCourse()],
          WITHDRAWN: [],
          TEMPORARILY_WITHDRAWN: [],
        },
        coursesCompletedInLast12Months: [],
      }

      const prisonerNumber = 'A1234GC'
      req.params.prisonerNumber = prisonerNumber

      const expectedInPrisonCourses: InPrisonCourseRecords = {
        problemRetrievingData: false,
        prisonNumber: prisonerNumber,
        totalRecords: 2,
        coursesByStatus: {
          COMPLETED: [aValidMathsInPrisonCourse()],
          IN_PROGRESS: [aValidEnglishInPrisonCourse()],
          WITHDRAWN: [],
          TEMPORARILY_WITHDRAWN: [],
        },
        coursesCompletedInLast12Months: [],
        hasCoursesCompletedMoreThan12MonthsAgo: null,
        hasWithdrawnOrInProgressCourses: null,
      }
      curiousService.getPrisonerInPrisonCourses.mockResolvedValue(expectedInPrisonCourses)

      // When
      await requestHandler(req, res, next)

      // Then
      expect(curiousService.getPrisonerInPrisonCourses).toHaveBeenCalledWith(prisonerNumber, token)
      expect(res.locals.inPrisonCourses).toEqual(expectedInPrisonCourses)
      expect(next).toHaveBeenCalled()
    })

    it('should not retrieve In Prison Courses given In Prison Courses for prisoner already in res.locals', async () => {
      // Given
      const prisonerNumber = 'A1234GC'
      req.params.prisonerNumber = prisonerNumber

      const expectedInPrisonCourses: InPrisonCourseRecords = {
        problemRetrievingData: false,
        prisonNumber: prisonerNumber,
        totalRecords: 2,
        coursesByStatus: {
          COMPLETED: [aValidMathsInPrisonCourse()],
          IN_PROGRESS: [aValidEnglishInPrisonCourse()],
          WITHDRAWN: [],
          TEMPORARILY_WITHDRAWN: [],
        },
        coursesCompletedInLast12Months: [],
        hasCoursesCompletedMoreThan12MonthsAgo: null,
        hasWithdrawnOrInProgressCourses: null,
      }
      res.locals.inPrisonCourses = expectedInPrisonCourses

      req.params.prisonerNumber = prisonerNumber

      // When
      await requestHandler(req, res, next)

      // Then
      expect(curiousService.getPrisonerInPrisonCourses).not.toHaveBeenCalled()
      expect(res.locals.inPrisonCourses).toEqual(expectedInPrisonCourses)
      expect(next).toHaveBeenCalled()
    })

    it('should retrieve In Prison Courses and store in res.locals given In Prison Courses with problem retrieving data already in res.locals', async () => {
      // Given
      const prisonerNumber = 'A1234GC'
      req.params.prisonerNumber = prisonerNumber

      res.locals.inPrisonCourses = {
        problemRetrievingData: true,
        prisonerNumber,
      }

      const expectedInPrisonCourses: InPrisonCourseRecords = {
        problemRetrievingData: false,
        prisonNumber: prisonerNumber,
        totalRecords: 2,
        coursesByStatus: {
          COMPLETED: [aValidMathsInPrisonCourse()],
          IN_PROGRESS: [aValidEnglishInPrisonCourse()],
          WITHDRAWN: [],
          TEMPORARILY_WITHDRAWN: [],
        },
        coursesCompletedInLast12Months: [],
        hasCoursesCompletedMoreThan12MonthsAgo: null,
        hasWithdrawnOrInProgressCourses: null,
      }
      curiousService.getPrisonerInPrisonCourses.mockResolvedValue(expectedInPrisonCourses)

      // When
      await requestHandler(req, res, next)

      // Then
      expect(curiousService.getPrisonerInPrisonCourses).toHaveBeenCalledWith(prisonerNumber, token)
      expect(res.locals.inPrisonCourses).toEqual(expectedInPrisonCourses)
      expect(next).toHaveBeenCalled()
    })
  })

  describe('Courses retrieved from Curious 2 endpoint', () => {
    beforeEach(() => {
      jest.replaceProperty(config.featureToggles, 'useCurious2Api', true)
    })

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
      expect(curiousService.getPrisonerInPrisonCourses).toHaveBeenCalledWith(prisonerNumber, token)
      expect(next).toHaveBeenCalled()
    })
  })
})
