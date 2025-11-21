import { RequestHandler } from 'express'
import CuriousService from '../services/curiousService'
import { InPrisonCourseRecords } from '../services/interfaces/curiousService/CuriousInPrisonCourses'
import config from '../config'
import { Result } from '../utils/result/result'

/**
 *  Middleware function that returns a Request handler function to look up the prisoner's In Prison Courses from Curious
 */
const retrieveCuriousInPrisonCourses = (curiousService: CuriousService): RequestHandler => {
  return async (req, res, next) => {
    const { prisonerNumber } = req.params

    // Lookup the prisoners In Prison Courses and store in res.locals
    if (config.featureToggles.useCurious2Api) {
      res.locals.inPrisonCourses = await Result.wrap(
        curiousService.getPrisonerInPrisonCourses(prisonerNumber, req.middleware.clientToken),
      )
      return next()
    }

    /*
      @deprecated - the following is the old behaviour/approach of getting In Prison Qualifications
      TODO - remove this code when In Prison Courses are retrieved from the Curious 2 endpoint via the useCurious2Api feature toggle.
    */
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
    return next()
  }
}

export default retrieveCuriousInPrisonCourses
