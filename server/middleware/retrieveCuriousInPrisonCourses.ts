import { RequestHandler } from 'express'
import CuriousService from '../services/curiousService'
import { Result } from '../utils/result/result'

/**
 *  Middleware function that returns a Request handler function to look up the prisoner's In Prison Courses from Curious
 */
const retrieveCuriousInPrisonCourses = (curiousService: CuriousService): RequestHandler => {
  return async (req, res, next) => {
    const { prisonerNumber } = req.params

    // Lookup the prisoners In Prison Courses and store in res.locals
    res.locals.inPrisonCourses = await Result.wrap(curiousService.getPrisonerInPrisonCourses(prisonerNumber))
    return next()
  }
}

export default retrieveCuriousInPrisonCourses
