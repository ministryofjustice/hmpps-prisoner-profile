import { NextFunction, Request, RequestHandler, Response } from 'express'
import { Result } from '../utils/result/result'
import CuriousService from '../services/curiousService'

/**
 *  Middleware function that returns a Request handler function to look up the prisoner's functional skills from Curious
 */
const retrieveCuriousFunctionalSkills = (curiousService: CuriousService): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { prisonerNumber } = req.params

    // Lookup the prisoners functional skills and store in res.locals
    res.locals.prisonerFunctionalSkills = await Result.wrap(curiousService.getPrisonerFunctionalSkills(prisonerNumber))

    return next()
  }
}
export default retrieveCuriousFunctionalSkills
