import { NextFunction, Request, Response } from 'express'
import { HmppsStatusCode } from '../data/enums/hmppsStatusCode'
import NotFoundError from '../utils/notFoundError'

export function parameterGuard(parameterName: string, acceptedValues: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const inputParameter = req?.params?.[parameterName]
    if (inputParameter && acceptedValues.some(value => value === inputParameter)) {
      return next()
    }

    return next(
      new NotFoundError(
        `Value ${inputParameter} is not supported for parameter ${parameterName}`,
        HmppsStatusCode.NOT_FOUND,
      ),
    )
  }
}

export default { parameterGuard }
