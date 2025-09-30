import { RequestHandler } from 'express'
import CuriousService from '../services/curiousService'
import { InPrisonCourseRecords } from '../services/interfaces/curiousService/CuriousInPrisonCourses'

/**
 *  Middleware function that returns a Request handler function to look up the prisoner's In Prison Courses from Curious
 */
const retrieveCuriousInPrisonCourses = (curiousService: CuriousService): RequestHandler => {
  return async (req, res, next) => {
    const { prisonerNumber } = req.params

    // Lookup the prisoners In Prison Courses and store in res.locals if its either not there, or is for a different prisoner
    const inPrisonCourses = res.locals.inPrisonCourses as InPrisonCourseRecords
    if (
      !inPrisonCourses ||
      inPrisonCourses.prisonNumber !== prisonerNumber ||
      inPrisonCourses.problemRetrievingData === true
    ) {
      res.locals.inPrisonCourses = await curiousService.getPrisonerInPrisonCourses(
        prisonerNumber,
        req.middleware.clientToken,
      )
    }
    next()
  }
}

export default retrieveCuriousInPrisonCourses
