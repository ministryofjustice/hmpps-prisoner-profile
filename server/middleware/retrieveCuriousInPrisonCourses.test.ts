import { Request, Response } from 'express'
import retrieveCuriousInPrisonCourses from './retrieveCuriousInPrisonCourses'
import { InPrisonCourseRecords } from '../services/interfaces/curiousService/CuriousInPrisonCourses'
import { aValidEnglishInPrisonCourse, aValidMathsInPrisonCourse } from '../data/localMockData/inPrisonCourse'
import CuriousService from '../services/curiousService'

jest.mock('../services/curiousService')

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
