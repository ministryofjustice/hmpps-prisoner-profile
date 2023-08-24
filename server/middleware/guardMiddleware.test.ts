import { NextFunction, Request, RequestHandler, Response } from 'express'
import guardMiddleware, { GuardOperator } from './guardMiddleware'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { Role } from '../data/enums/role'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import NotFoundError from '../utils/notFoundError'
import { addMiddlewareError } from './middlewareHelpers'

let req: any
let res: any
let next: NextFunction
let successHandler: RequestHandler
let failHandler: RequestHandler

describe('GuardMiddleware', () => {
  beforeEach(() => {
    req = {
      params: { prisonerNumber: 'G6123VU' },
      path: 'test/path',
      middleware: {
        prisonerData: PrisonerMockDataA,
      },
    }
    res = {
      locals: {
        user: {
          activeCaseLoadId: 'MDI',
          userRoles: [Role.PrisonUser],
          caseLoads: CaseLoadsDummyDataA,
        },
        clientToken: 'CLIENT_TOKEN',
      },
      render: jest.fn(),
    }
    next = jest.fn()

    successHandler = (reqSuccess: Request, resSuccess: Response, nextSuccess: NextFunction) => {
      return nextSuccess()
    }

    failHandler = (reqFail: Request, resFail: Response, nextFail: NextFunction) => {
      addMiddlewareError(reqFail, nextFail, new NotFoundError())
      return nextFail()
    }
  })
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should return next() if no handlers are passed in', () => {
    guardMiddleware(GuardOperator.OR)(req, res, next)

    expect(next).toHaveBeenCalledWith()
  })

  describe('Guard with OR operator', () => {
    it('should return NotFoundError if all handlers fail', async () => {
      await guardMiddleware(GuardOperator.OR, failHandler, failHandler)(req, res, next)

      expect(next).toHaveBeenCalledWith(new NotFoundError('GuardMiddleware: Guard #1 Fail'))
    })

    it('should return next() if one handler succeeds', async () => {
      await guardMiddleware(GuardOperator.OR, successHandler, failHandler)(req, res, next)

      expect(next).toHaveBeenCalledWith()
    })

    it('should return next() if all handlers succeed', async () => {
      await guardMiddleware(GuardOperator.OR, successHandler, successHandler)(req, res, next)

      expect(next).toHaveBeenCalledWith()
    })
  })

  describe('Guard with AND operator', () => {
    it('should return NotFoundError if all handlers fail', async () => {
      await guardMiddleware(GuardOperator.AND, failHandler, failHandler)(req, res, next)

      expect(next).toHaveBeenCalledWith(new NotFoundError('GuardMiddleware: Guard #1 Fail'))
    })

    it('should return NotFoundError if one handler fails', async () => {
      await guardMiddleware(GuardOperator.AND, successHandler, failHandler)(req, res, next)

      expect(next).toHaveBeenCalledWith(new NotFoundError('GuardMiddleware: Guard #1 Fail'))
    })

    it('should return next() if all handlers succeed', async () => {
      await guardMiddleware(GuardOperator.AND, successHandler, successHandler)(req, res, next)

      expect(next).toHaveBeenCalledWith()
    })
  })
})
