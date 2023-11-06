import { Request, Response } from 'express'
import addRequestId from './addRequestId'

describe('addRequestId', () => {
  it('Adds a request ID to the response object', () => {
    const middleware = addRequestId()
    const res: Response = { locals: {} } as Response
    const nextFn = jest.fn()
    middleware({} as Request, res, nextFn)
    expect(res.locals.requestId).not.toBeUndefined()
    expect(nextFn).toBeCalled()
  })
})
