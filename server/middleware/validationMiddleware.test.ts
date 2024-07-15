import { Request, Response } from 'express'
import HmppsError from '../interfaces/HmppsError'
import validationMiddleware, { Validator } from './validationMiddleware'

describe('Validation middleware', () => {
  let req: Request = {} as Request
  let res = {} as Response
  const next = jest.fn()
  const error: HmppsError = { text: 'error message', href: 'error' }
  const errorTwo: HmppsError = { text: 'error message 2', href: 'error2' }

  beforeEach(() => {
    jest.resetAllMocks()
    res = { redirect: jest.fn() } as any
    req = {
      body: { example: 'text' },
      header: (key: string) => {
        if (key === 'Referer') {
          return '/path/to/referer'
        }
        return '/'
      },
      flash: jest.fn(),
    } as any
  })

  it('should add errors to request object when any are present', async () => {
    const alwaysFailsValidator: Validator = () => [error]
    const middleware = validationMiddleware([alwaysFailsValidator])
    await middleware(req, res, next)

    expect(req.errors).toEqual([error])
    expect(next).toHaveBeenCalled()
  })

  it('should add errors to request object if any are present and return a promise', async () => {
    const alwaysFailsValidator: Validator = () => Promise.resolve([error])
    await validationMiddleware([alwaysFailsValidator])(req, res, next)

    expect(req.errors).toEqual([error])
    expect(next).toHaveBeenCalled()
  })

  it('should not add any errors to request object when no errors are present', async () => {
    const neverFailsValidator: Validator = () => []
    await validationMiddleware([neverFailsValidator])(req, res, next)

    expect(req.errors).toEqual(undefined)
    expect(next).toHaveBeenCalled()
  })

  it('should receive a request body', async () => {
    const mockValidator: Validator = jest.fn().mockReturnValue([])
    validationMiddleware([mockValidator])(req, res, next)

    expect(mockValidator).toHaveBeenCalledWith(req.body)
  })

  it('should handle multiple validators', async () => {
    const firstValidator: Validator = () => [error]
    const secondValidator: Validator = () => [errorTwo]

    await validationMiddleware([firstValidator, secondValidator])(req, res, next)

    expect(req.errors).toEqual([error, errorTwo])
    expect(next).toHaveBeenCalled()
  })

  it('Redirects with data in the flash if redirectBackOnError', async () => {
    const alwaysFailsValidator: Validator = () => Promise.resolve([error])

    await validationMiddleware([alwaysFailsValidator], { redirectBackOnError: true })(req, res, next)
    expect(res.redirect).toHaveBeenCalledWith('/path/to/referer')
    expect(req.flash).toHaveBeenCalledWith('requestBody', JSON.stringify(req.body))
    expect(req.flash).toHaveBeenCalledWith('errors', [error])
  })
})
