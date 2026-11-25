import type { RequestHandler } from 'express'
import NotFoundError from '../utils/notFoundError'

export function parameterGuard(parameterName: string, acceptedValues: readonly string[]): RequestHandler {
  return (req, _res, next) => {
    const inputParameter = req?.params?.[parameterName]
    if (inputParameter && acceptedValues.some(value => value === inputParameter)) {
      return next()
    }

    return next(new NotFoundError(`Value ${inputParameter} is not supported for parameter ${parameterName}`))
  }
}

export default { parameterGuard }
