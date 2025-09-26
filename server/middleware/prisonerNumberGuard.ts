import { NextFunction, Request, Response } from 'express'
import NotFoundError from '../utils/notFoundError'

const prisonerNumberRegex = /^[a-zA-Z][0-9]{4}[a-zA-Z]{2}$/

export function prisonerNumberGuard() {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const { prisonerNumber } = req.params

    if (!prisonerNumber || !prisonerNumberRegex.test(prisonerNumber)) {
      return next(new NotFoundError(`Value ${prisonerNumber} is not a valid prisoner number`))
    }

    return next()
  }
}

export default { prisonerNumberGuard }
