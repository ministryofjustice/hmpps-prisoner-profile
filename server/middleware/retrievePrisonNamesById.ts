import { NextFunction, Request, RequestHandler, Response } from 'express'
import { Result } from '../utils/result/result'
import PrisonService from '../services/prisonService'

/**
 *  Middleware function that returns a Request handler function to retrieve prison names by ID from PrisonService and store in res.locals
 */
const retrievePrisonNamesById = (prisonService: PrisonService): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { apiErrorCallback } = res.locals
    res.locals.prisonNamesById = await Result.wrap(
      prisonService.getAllPrisonNamesById(req.middleware.clientToken),
      apiErrorCallback,
    )

    return next()
  }
}

export default retrievePrisonNamesById
