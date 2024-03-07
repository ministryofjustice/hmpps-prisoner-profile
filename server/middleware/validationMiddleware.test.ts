import { Request, Response } from 'express'
import HmppsError from '../interfaces/HmppsError'
import validationMiddleware, { Validator } from './validationMiddleware'

describe('Validation middleware', () => {
  let req: Request = {} as Request
  const res = {} as Response
  const next = jest.fn()
  const error: HmppsError = { text: 'error message', href: 'error' }
  const errorTwo: HmppsError = { text: 'error message 2', href: 'error2' }

  beforeEach(() => {
    jest.resetAllMocks()
    req = {} as Request
  })

  it('should add errors to request object when any are present', async () => {
    const alwaysFailsValidator: Validator = () => [error]
    const middleware = validationMiddleware(alwaysFailsValidator)
    await middleware(req, res, next)

    expect(req.errors).toEqual([error])
    expect(next).toHaveBeenCalled()
  })

  it('should add errors to request object if any are present and return a promise', async () => {
    const alwaysFailsValidator: Validator = () => Promise.resolve([error])
    await validationMiddleware(alwaysFailsValidator)(req, res, next)

    expect(req.errors).toEqual([error])
    expect(next).toHaveBeenCalled()
  })

  it('should not add any errors to request object when no errors are present', async () => {
    const neverFailsValidator: Validator = () => []
    await validationMiddleware(neverFailsValidator)(req, res, next)

    expect(req.errors).toEqual(undefined)
    expect(next).toHaveBeenCalled()
  })

  it('should receive a request body', async () => {
    const mockValidator: Validator = jest.fn().mockReturnValue([])
    validationMiddleware(mockValidator)(req, res, next)

    expect(mockValidator).toHaveBeenCalledWith(req.body)
  })

  it('should handle multiple validators', async () => {
    const firstValidator: Validator = () => [error]
    const secondValidator: Validator = () => [errorTwo]

    await validationMiddleware(firstValidator, secondValidator)(req, res, next)

    expect(req.errors).toEqual([error, errorTwo])
    expect(next).toHaveBeenCalled()
  })
})
