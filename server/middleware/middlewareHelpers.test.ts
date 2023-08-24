import { NextFunction } from 'express'
import NotFoundError from '../utils/notFoundError'
import { addMiddlewareError } from './middlewareHelpers'

let req: any
let next: NextFunction

describe('MiddlewareHelpers', () => {
  beforeEach(() => {
    req = {
      params: { prisonerNumber: 'G6123VU' },
      path: 'test/path',
      middleware: {},
    }
    next = jest.fn()
  })

  it('should return next(error) if usingGuard is 0', () => {
    req.middleware.usingGuard = 0

    const retVal = addMiddlewareError(req, next, new NotFoundError())

    expect(req.middleware.errors).toBeUndefined()
    expect(retVal).toEqual(new NotFoundError())
  })

  it('should return middleware error if usingGuard is 1', () => {
    req.middleware.usingGuard = 1

    addMiddlewareError(req, next, new NotFoundError())

    expect(req.middleware.errors['1']).toEqual([new NotFoundError()])
  })
})
